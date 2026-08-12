"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 border-l-4 border-primary bg-muted/60 px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2 font-semibold text-primary">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={cn("h-5 w-5 text-primary transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div id={panelId} className="px-4 py-4">
          {children}
        </div>
      ) : null}
    </div>
  )
}
