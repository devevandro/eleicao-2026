// Constantes e tipos para a API pública do TSE (Divulgação de Candidaturas)
// Configuração pública da eleição e da API do TSE.

export const TSE_BASE =
  process.env.NEXT_PUBLIC_TSE_CANDIDATURA_URL ??
  "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura"
export const TSE_ELEICAO_BASE =
  process.env.NEXT_PUBLIC_TSE_ELEICAO_URL ??
  "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/eleicao"
export const ANO = process.env.NEXT_PUBLIC_TSE_ANO ?? "2026"
export const DEFAULT_UF = process.env.NEXT_PUBLIC_TSE_UF_PADRAO ?? "PR"
export const ID_ELEICAO = process.env.NEXT_PUBLIC_TSE_ID_ELEICAO ?? "20322002026"

export const TSE_HEADERS: Record<string, string> = {
  Accept: "application/json, text/plain, */*",
  Referer: "https://divulgacandcontas.tse.jus.br/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
}

// Rótulos dos cargos que podem ser exibidos.
// Os códigos são padronizados nacionalmente pelo TSE.
export const CARGO_LABELS: Record<number, { nome: string; nomePlural: string }> = {
  1: { nome: "Presidente", nomePlural: "Presidente" },
  3: { nome: "Governador", nomePlural: "Governador" },
  5: { nome: "Senador", nomePlural: "Senador" },
  6: { nome: "Deputado Federal", nomePlural: "Deputado Federal" },
  7: { nome: "Deputado Estadual", nomePlural: "Deputado Estadual" },
}

// Ordem e conjunto de cargos disponíveis nas tabs.
// Presidente é candidatura nacional (UF "BR"); os demais são por estado.
export const MAIN_CARGO_CODES = [1, 3, 5, 6, 7]

export function getCargoByCodigo(codigo: number): { codigo: number; nome: string } | undefined {
  const label = CARGO_LABELS[codigo]
  return label ? { codigo, nome: label.nome } : undefined
}

// Estado / Unidade Eleitoral vinda de /eleicao/eleicao-atual (campo "ues").
export type CargoContagem = {
  codigo: number
  nome: string
  contagem: number
}

export type Estado = {
  sigla: string
  nome: string
  regiao: string
  cargos: CargoContagem[]
}

// A foto pode ser construída a partir do id do candidato mesmo quando fotoUrl é nula na listagem.
export function fotoUrl(idCandidato: number | string, uf: string = DEFAULT_UF): string {
  return `${TSE_BASE.replace("/v1/candidatura", "")}/arquivo/img/${ID_ELEICAO}/${idCandidato}/${uf || DEFAULT_UF}`
}

// ---- Tipos ----

export type Partido = {
  numero: number
  sigla: string
  nome: string | null
}

export type CargoInfo = {
  codigo: number
  nome: string
  titular: boolean
}

export type CandidatoResumo = {
  id: number
  nomeUrna: string
  numero: number
  nomeCompleto: string
  descricaoSituacao: string | null
  descricaoTotalizacao: string | null
  nomeColigacao: string | null
  ufCandidatura: string | null
  partido: Partido
  cargo: CargoInfo
}

export type ListagemResposta = {
  cargo: CargoInfo
  candidatos: CandidatoResumo[]
}

export type Bem = {
  ordem: number
  descricao: string
  descricaoDeTipoDeBem: string
  valor: number
  dataUltimaAtualizacao: string
}

export type EleicaoAnterior = {
  nrAno: number
  nomeUrna: string
  nomeCandidato: string
  local: string
  cargo: string
  partido: string
  situacaoTotalizacao: string
  nrCandidato: number
}

export type ViceInfo = {
  id: number
  nomeUrna: string
  nomeCompleto: string
  numero: number
  cargo?: CargoInfo
  partido?: Partido
}

export type CandidatoDetalhe = CandidatoResumo & {
  descricaoSexo: string | null
  dataDeNascimento: string | null
  cpf: string | null
  descricaoEstadoCivil: string | null
  descricaoCorRaca: string | null
  nacionalidade: string | null
  grauInstrucao: string | null
  ocupacao: string | null
  sgUfNascimento: string | null
  nomeMunicipioNascimento: string | null
  localCandidatura: string | null
  dataUltimaAtualizacao: string | null
  descricaoNaturalidade: string | null
  composicaoColigacao: string | null
  totalDeBens: number | null
  bens: Bem[] | null
  vices: ViceInfo[] | null
  eleicoesAnteriores: EleicaoAnterior[] | null
  sites: string[] | null
}

// ---- Formatadores ----

export function formatCPF(cpf: string | null): string | null {
  if (!cpf) return null
  const digits = cpf.replace(/\D/g, "").padStart(11, "0")
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export function formatData(iso: string | null): string | null {
  if (!iso) return null
  // aceita "1968-04-14" ou "2026-08-11 12:53"
  const datePart = iso.split(" ")[0]
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function formatMoeda(valor: number | null | undefined): string {
  if (valor == null) return "R$ 0,00"
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function capitalizarNome(nome: string | null): string {
  if (!nome) return ""
  return nome
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)))
    .join(" ")
}
