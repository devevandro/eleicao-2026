import Link from "next/link"
import { CandidatePhoto } from "@/components/candidate-photo"
import { capitalizarNome, type CandidatoResumo } from "@/lib/tse"

export function CandidateCard({ candidato }: { candidato: CandidatoResumo }) {
  const coligacao = candidato.nomeColigacao || candidato.partido?.sigla || "—"
  const situacao = candidato.descricaoTotalizacao || candidato.descricaoSituacao

  return (
    <Link
      href={`/candidato/${candidato.id}${candidato.ufCandidatura ? `?uf=${candidato.ufCandidatura}` : ""}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <CandidatePhoto
          id={candidato.id}
          nome={candidato.nomeUrna}
          uf={candidato.ufCandidatura}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {situacao ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-status px-2 py-0.5 text-xs font-medium text-status-foreground shadow-sm">
            {situacao}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-2 py-1 font-mono text-sm font-bold tabular-nums text-primary-foreground">
            {candidato.numero}
          </span>
          <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {candidato.cargo?.nome}
          </span>
        </div>

        <h3 className="text-pretty text-base font-semibold leading-tight text-card-foreground">
          {capitalizarNome(candidato.nomeUrna)}
        </h3>

        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          <span className="text-sm font-medium text-foreground">
            {candidato.partido?.sigla}
          </span>
          <span className="text-pretty text-xs leading-snug text-muted-foreground">
            {coligacao}
          </span>
        </div>
      </div>
    </Link>
  )
}
