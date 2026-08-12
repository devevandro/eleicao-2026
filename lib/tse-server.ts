import "server-only"
import { TSE_BASE, ANO, ID_ELEICAO, TSE_HEADERS, type CandidatoDetalhe } from "@/lib/tse"

// Todas as UFs + BR. Usamos a UF informada primeiro (via query
// param vindo do card) e, se falhar, tentamos as demais como fallback.
const TODAS_UFS = [
  "BR", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP",
  "SE", "TO",
]

async function buscar(uf: string, id: string): Promise<CandidatoDetalhe | null> {
  const url = `${TSE_BASE}/buscar/${ANO}/${uf}/${ID_ELEICAO}/candidato/${id}`
  try {
    const res = await fetch(url, { headers: TSE_HEADERS, next: { revalidate: 300 } })
    if (res.ok) return (await res.json()) as CandidatoDetalhe
  } catch {
    // ignora e tenta a próxima UF
  }
  return null
}

export async function getCandidato(id: string, uf?: string): Promise<CandidatoDetalhe | null> {
  if (!/^\d+$/.test(id)) return null

  const preferida = uf?.toUpperCase()
  if (preferida && /^[A-Z]{2}$/.test(preferida)) {
    const hit = await buscar(preferida, id)
    if (hit) return hit
  }

  for (const u of TODAS_UFS) {
    if (u === preferida) continue
    const hit = await buscar(u, id)
    if (hit) return hit
  }
  return null
}
