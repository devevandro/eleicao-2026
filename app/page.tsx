import { CandidatesBrowser } from "@/components/candidates-browser"
import { Vote } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Vote className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
                Eleições 2026 · Brasil
              </p>
              <h1 className="text-balance text-2xl font-bold leading-tight sm:text-3xl">
                Candidatos do Brasil
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-primary-foreground/80">
            Consulte candidaturas em todo o Brasil para Presidente, Governador, Senador, Deputado
            Federal e Deputado Estadual. Selecione o estado (ou Brasil, para Presidente), o cargo
            e use os filtros de nome, número, partido ou coligação. Dados oficiais do TSE.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CandidatesBrowser />
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Fonte: Tribunal Superior Eleitoral (TSE) — Divulgação de Candidaturas e Contas
          Eleitorais. Aplicação não oficial, para fins informativos.
        </div>
      </footer>
    </main>
  )
}
