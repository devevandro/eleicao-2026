import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, Network, Landmark, ExternalLink } from "lucide-react"
import { getCandidato } from "@/lib/tse-server"
import {
  capitalizarNome,
  formatCPF,
  formatData,
  formatMoeda,
  getCargoByCodigo,
} from "@/lib/tse"
import { CandidatePhoto } from "@/components/candidate-photo"
import { CollapsibleSection } from "@/components/collapsible-section"

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ uf?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { uf } = await searchParams
  const candidato = await getCandidato(id, uf)
  if (!candidato) return { title: "Candidato não encontrado" }
  return {
    title: `${capitalizarNome(candidato.nomeUrna)} — Candidatos 2026`,
    description: `${candidato.cargo?.nome} · ${candidato.partido?.sigla} · Nº ${candidato.numero}`,
  }
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-foreground">{label}:</dt>
      <dd className="mt-0.5 text-sm text-muted-foreground">{value || "Não informado"}</dd>
    </div>
  )
}

export default async function CandidatoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ uf?: string }>
}) {
  const { id } = await params
  const { uf } = await searchParams
  const candidato = await getCandidato(id, uf)

  if (!candidato) notFound()

  const cargo = getCargoByCodigo(candidato.cargo?.codigo) ?? candidato.cargo
  const situacao = candidato.descricaoTotalizacao || candidato.descricaoSituacao || "—"
  const localUf = [candidato.localCandidatura, candidato.ufSuperiorCandidatura || candidato.ufCandidatura]
    .filter(Boolean)
    .join(" / ")
  const naturalidade =
    candidato.nomeMunicipioNascimento && candidato.sgUfNascimento
      ? `${candidato.sgUfNascimento}-${capitalizarNome(candidato.nomeMunicipioNascimento)}`
      : candidato.descricaoNaturalidade && candidato.descricaoNaturalidade !== "null-null"
        ? candidato.descricaoNaturalidade
        : null
  const nacionalidadeNaturalidade = [candidato.nacionalidade, naturalidade]
    .filter(Boolean)
    .join(" / ")

  const bens = candidato.bens ?? []
  const eleicoes = candidato.eleicoesAnteriores ?? []
  const vices = candidato.vices ?? []

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para a lista
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Cartão lateral */}
          <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                <CandidatePhoto
                  id={candidato.id}
                  nome={candidato.nomeUrna}
                  uf={candidato.ufCandidatura}
                  className="aspect-[4/5] w-full"
                />
                <span className="absolute inset-x-0 bottom-0 bg-status py-1.5 text-center text-sm font-semibold text-status-foreground">
                  {situacao}
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="font-mono text-xl font-bold tabular-nums text-foreground">
                {candidato.numero}
              </p>
              {candidato.cpf ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  CPF: {formatCPF(candidato.cpf)}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">
                {cargo?.nome} - {localUf}
              </p>
              <p className="text-sm text-muted-foreground">
                {capitalizarNome(candidato.partido?.nome)} - {candidato.partido?.sigla}
              </p>
              <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-foreground">
                {candidato.numero}
              </p>
            </div>
          </aside>

          {/* Painel de detalhes */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {candidato.cargo?.titular === false ? "Vice" : "Titular"}
              </h1>
              {candidato.dataUltimaAtualizacao ? (
                <p className="text-sm text-muted-foreground">
                  Última Atualização: {formatData(candidato.dataUltimaAtualizacao)}{" "}
                  {candidato.dataUltimaAtualizacao.split(" ")[1] ?? ""}
                </p>
              ) : null}
            </div>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 py-5 sm:grid-cols-2">
              <Field label="Nome Completo" value={capitalizarNome(candidato.nomeCompleto)} />
              <Field label="Data de Nascimento" value={formatData(candidato.dataDeNascimento)} />
              <Field label="Gênero" value={generoLabel(candidato.descricaoSexo)} />
              <Field label="Estado Civil" value={capitalizarNome(candidato.descricaoEstadoCivil)} />
              <Field label="Grau de Instrução" value={capitalizarNome(candidato.grauInstrucao)} />
              <Field label="Ocupação" value={capitalizarNome(candidato.ocupacao)} />
              <Field label="Nacionalidade / Naturalidade" value={nacionalidadeNaturalidade} />
              <Field label="Cor / Raça" value={capitalizarNome(candidato.descricaoCorRaca)} />
            </dl>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">
                {candidato.descricaoTipoDrap === "Federação" ? "Federação" : "Coligação"}:
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {candidato.nomeColigacao || "Não informado"}
              </p>
            </div>

            {candidato.sites && candidato.sites.length > 0 ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Sites e redes:</p>
                <ul className="flex flex-col gap-1">
                  {candidato.sites.map((site) => (
                    <li key={site}>
                      <a
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 break-all text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {site}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3">
              {vices.length > 0 ? (
                <CollapsibleSection
                  title="Vice / Suplentes"
                  icon={<Network className="h-4 w-4" aria-hidden="true" />}
                >
                  <ul className="flex flex-col divide-y divide-border">
                    {vices.map((v) => (
                      <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="font-medium text-foreground">
                          {capitalizarNome(v.nomeUrna)}
                        </span>
                        <span className="text-muted-foreground">
                          {v.partido?.sigla} · Nº {v.numero}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              ) : null}

              <CollapsibleSection
                title="Eleições"
                icon={<Network className="h-4 w-4" aria-hidden="true" />}
                defaultOpen={eleicoes.length > 0}
              >
                {eleicoes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-4 font-medium">Ano</th>
                          <th className="py-2 pr-4 font-medium">Cargo</th>
                          <th className="py-2 pr-4 font-medium">Partido</th>
                          <th className="py-2 pr-4 font-medium">Nº</th>
                          <th className="py-2 font-medium">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {eleicoes.map((e, i) => (
                          <tr key={`${e.nrAno}-${i}`}>
                            <td className="py-2 pr-4 font-mono tabular-nums text-foreground">{e.nrAno}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{e.cargo}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{e.partido}</td>
                            <td className="py-2 pr-4 font-mono tabular-nums text-muted-foreground">
                              {e.nrCandidato}
                            </td>
                            <td className="py-2 text-muted-foreground">{e.situacaoTotalizacao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem eleições registradas.</p>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Bens do Candidato"
                icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
              >
                {bens.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <ul className="flex flex-col divide-y divide-border">
                      {bens.map((b) => (
                        <li
                          key={b.ordem}
                          className="flex items-start justify-between gap-4 py-2.5 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">{capitalizarNome(b.descricao)}</p>
                            <p className="text-xs text-muted-foreground">{b.descricaoDeTipoDeBem}</p>
                          </div>
                          <span className="shrink-0 font-mono tabular-nums text-foreground">
                            {formatMoeda(b.valor)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
                      <span className="text-foreground">Total de bens declarados</span>
                      <span className="font-mono tabular-nums text-primary">
                        {formatMoeda(candidato.totalDeBens)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum bem declarado.</p>
                )}
              </CollapsibleSection>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function generoLabel(sexo: string | null): string | null {
  if (!sexo) return null
  const s = sexo.toUpperCase()
  if (s.startsWith("MASC")) return "Masculino"
  if (s.startsWith("FEM")) return "Feminino"
  return capitalizarNome(sexo)
}
