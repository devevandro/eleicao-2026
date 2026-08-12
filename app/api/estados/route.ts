import { NextResponse } from "next/server"
import {
  ANO,
  ID_ELEICAO,
  TSE_ELEICAO_BASE,
  TSE_HEADERS,
  MAIN_CARGO_CODES,
  type Estado,
} from "@/lib/tse"

export const revalidate = 3600

export async function GET() {
  const url = `${TSE_ELEICAO_BASE}/eleicao-atual?idEleicao=${ID_ELEICAO}&ano=${ANO}`

  try {
    const res = await fetch(url, {
      headers: TSE_HEADERS,
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao consultar o TSE (${res.status})` },
        { status: 502 },
      )
    }

    const data = await res.json()
    const ues = Array.isArray(data?.ues) ? data.ues : []

    const estados: Estado[] = ues.map((ue: any) => ({
      sigla: ue.sigla,
      nome: ue.nome,
      regiao: ue.regiao,
      cargos: (ue.cargos ?? [])
        .filter((c: any) => MAIN_CARGO_CODES.includes(c.codigo))
        .map((c: any) => ({ codigo: c.codigo, nome: c.nome, contagem: c.contagem ?? 0 })),
    }))

    return NextResponse.json({ estados })
  } catch {
    return NextResponse.json({ error: "Erro de conexão com o TSE" }, { status: 502 })
  }
}
