import { NextResponse } from "next/server"
import { TSE_BASE, ANO, DEFAULT_UF, ID_ELEICAO, TSE_HEADERS } from "@/lib/tse"

export const revalidate = 300

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 })
  }

  const url = `${TSE_BASE}/buscar/${ANO}/${DEFAULT_UF}/${ID_ELEICAO}/candidato/${id}`

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
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o TSE" }, { status: 502 })
  }
}
