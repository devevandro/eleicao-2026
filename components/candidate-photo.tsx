"use client"

import { useState } from "react"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { fotoUrl } from "@/lib/tse"

export function CandidatePhoto({
  id,
  nome,
  uf,
  className,
}: {
  id: number
  nome: string
  uf?: string | null
  className?: string
}) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <User className="h-1/3 w-1/3" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fotoUrl(id, uf ?? undefined) || "/placeholder.svg"}
      alt={`Foto de ${nome}`}
      className={cn("object-cover object-top", className)}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}
