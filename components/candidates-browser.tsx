"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { Search, AlertCircle, ChevronDown, MapPin } from "lucide-react"
import { CandidateCard } from "@/components/candidate-card"
import {
  CARGO_LABELS,
  DEFAULT_UF,
  MAIN_CARGO_CODES,
  type CandidatoResumo,
  type Estado,
} from "@/lib/tse"
import { cn } from "@/lib/utils"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Falha ao carregar dados")
  return res.json()
}

// Ordem de exibição das regiões nos grupos do seletor.
const ORDEM_REGIOES: { chave: string; rotulo: string }[] = [
  { chave: "NORTE", rotulo: "Norte" },
  { chave: "NORDESTE", rotulo: "Nordeste" },
  { chave: "CENTRO-OESTE", rotulo: "Centro-Oeste" },
  { chave: "SUDESTE", rotulo: "Sudeste" },
  { chave: "SUL", rotulo: "Sul" },
]

export function CandidatesBrowser() {
  const { data: estadosData, error: estadosError } = useSWR<{ estados: Estado[] }>(
    "/api/estados",
    fetcher,
    { revalidateOnFocus: false },
  )
  const estados = estadosData?.estados ?? []

  const [uf, setUf] = useState(DEFAULT_UF)
  const [cargo, setCargo] = useState<number | null>(null)
  const [busca, setBusca] = useState("")
  const [partido, setPartido] = useState("")

  const estadoSelecionado = useMemo(
    () => estados.find((e) => e.sigla === uf),
    [estados, uf],
  )

  // Cargos disponíveis (titulares) para o estado selecionado, na ordem padrão.
  const cargosDisponiveis = useMemo(() => {
    const cargos = estadoSelecionado?.cargos ?? []
    return MAIN_CARGO_CODES.map((codigo) => cargos.find((c) => c.codigo === codigo)).filter(
      (c): c is NonNullable<typeof c> => Boolean(c),
    )
  }, [estadoSelecionado])

  // Garante um cargo válido sempre que o estado (ou a lista de cargos) muda.
  useEffect(() => {
    if (cargosDisponiveis.length === 0) return
    if (!cargosDisponiveis.some((c) => c.codigo === cargo)) {
      setCargo(cargosDisponiveis[0].codigo)
    }
  }, [cargosDisponiveis, cargo])

  // Regiões agrupadas para o seletor.
  const gruposRegiao = useMemo(() => {
    return ORDEM_REGIOES.map((r) => ({
      ...r,
      estados: estados
        .filter((e) => e.regiao === r.chave)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    })).filter((g) => g.estados.length > 0)
  }, [estados])

  const { data, error, isLoading } = useSWR(
    cargo ? `/api/candidatos?uf=${uf}&cargo=${cargo}` : null,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true },
  )
  const candidatos: CandidatoResumo[] = data?.candidatos ?? []

  // Ao trocar estado ou cargo, limpa o filtro de partido.
  useEffect(() => {
    setPartido("")
  }, [uf, cargo])

  const partidos = useMemo(() => {
    const siglas = new Set<string>()
    for (const c of candidatos) {
      if (c.partido?.sigla) siglas.add(c.partido.sigla)
    }
    return Array.from(siglas).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [candidatos])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR")
    return candidatos.filter((c) => {
      if (partido && c.partido?.sigla !== partido) return false
      if (!termo) return true
      return (
        c.nomeUrna?.toLocaleLowerCase("pt-BR").includes(termo) ||
        c.nomeCompleto?.toLocaleLowerCase("pt-BR").includes(termo) ||
        String(c.numero).includes(termo) ||
        c.partido?.sigla?.toLocaleLowerCase("pt-BR").includes(termo) ||
        c.nomeColigacao?.toLocaleLowerCase("pt-BR").includes(termo)
      )
    })
  }, [candidatos, busca, partido])

  return (
    <div className="flex flex-col gap-6">
      {/* Seletor de estado */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="estado"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <MapPin className="h-3.5 w-3.5" />
            Estado
          </label>
          <div className="relative">
            <select
              id="estado"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              disabled={estados.length === 0}
              className="w-full min-w-56 appearance-none rounded-lg border border-input bg-background py-2.5 pl-4 pr-10 text-base font-semibold text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {estados.length === 0 ? (
                <option>Carregando estados…</option>
              ) : (
                gruposRegiao.map((g) => (
                  <optgroup key={g.chave} label={g.rotulo}>
                    {g.estados.map((e) => (
                      <option key={e.sigla} value={e.sigla}>
                        {`${e.nome} (${e.sigla})`}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {estadoSelecionado ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{estadoSelecionado.nome}</span>
            {estadoSelecionado.regiao !== "BR" ? ` · Região ${estadoSelecionado.regiao}` : ""}
          </p>
        ) : null}
      </div>

      {estadosError ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Não foi possível carregar a lista de estados do TSE.</span>
        </div>
      ) : null}

      {/* Tabs de cargo (dinâmicas por estado) */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Cargos">
        {cargosDisponiveis.map((c) => {
          const ativo = c.codigo === cargo
          const rotulo = CARGO_LABELS[c.codigo]?.nomePlural ?? c.nome
          return (
            <button
              key={c.codigo}
              role="tab"
              aria-selected={ativo}
              onClick={() => setCargo(c.codigo)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ativo
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {rotulo}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  ativo ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                {c.contagem}
              </span>
            </button>
          )
        })}
      </div>

      {/* Busca e filtro por partido */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, número, partido ou coligação"
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Buscar candidatos"
          />
        </div>

        <div className="relative sm:w-56">
          <select
            value={partido}
            onChange={(e) => setPartido(e.target.value)}
            className="w-full appearance-none rounded-lg border border-input bg-card py-2.5 pl-4 pr-10 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filtrar por partido"
          >
            <option value="">Todos os partidos</option>
            {partidos.map((sigla) => (
              <option key={sigla} value={sigla}>
                {sigla}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Contador */}
      {!isLoading && !error && cargo ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtrados.length} candidato{filtrados.length === 1 ? "" : "s"}
          {busca || partido ? " encontrado(s)" : ""}
          {partido ? ` · ${partido}` : ""}
        </p>
      ) : null}

      {/* Estados */}
      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Não foi possível carregar os dados do TSE. Tente novamente em instantes.</span>
        </div>
      ) : isLoading || !cargo ? (
        <SkeletonGrid />
      ) : filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum candidato encontrado para esta busca.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtrados.map((c) => (
            <CandidateCard key={c.id} candidato={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
