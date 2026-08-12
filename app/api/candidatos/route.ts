import { NextResponse } from "next/server"
import { TSE_BASE, ANO, ID_ELEICAO, TSE_HEADERS, MAIN_CARGO_CODES } from "@/lib/tse"

export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uf = (searchParams.get("uf") ?? "").toUpperCase()
  const codigo = Number(searchParams.get("cargo"))

  if (!/^[A-Z]{2}$/.test(uf)) {
    return NextResponse.json({ error: "UF inválida" }, { status: 400 })
  }
  if (!MAIN_CARGO_CODES.includes(codigo)) {
    return NextResponse.json({ error: "Cargo inválido" }, { status: 400 })
  }

  const url = `${TSE_BASE}/listar/${ANO}/${uf}/${ID_ELEICAO}/${codigo}/candidatos`

  try {
    const res = await fetch(url, {
      headers: TSE_HEADERS,
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao consultar o TSE (${res.status})` },
        { status: 502 },
      )
    }

    const data = await res.json()
    return NextResponse.json({
      cargo: data.cargo,
      candidatos: data.candidatos ?? [],
    })
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o TSE" }, { status: 502 })
  }
}
