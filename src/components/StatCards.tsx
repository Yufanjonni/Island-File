import { Card, CardContent } from './ui/Card'
import type { ReactNode } from 'react'

type StatCard = {
  label: string
  value: string
  description?: string
  icon?: ReactNode
  accentClassName?: string
  surfaceClassName?: string
  iconClassName?: string
}

export function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`overflow-hidden border-0 shadow-[var(--shadow-md)] ${stat.surfaceClassName ?? 'bg-white'}`}
        >
          <CardContent className="relative flex min-h-[144px] items-start justify-between gap-4 p-6">
            <div className={`absolute inset-x-0 top-0 h-1.5 ${stat.accentClassName ?? 'bg-[var(--primary)]'}`} />
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/45" />
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl font-bold leading-tight text-slate-950">{stat.value}</div>
              {stat.description && (
                <div className="mt-2 text-xs font-medium leading-5 text-slate-500">{stat.description}</div>
              )}
            </div>
            {stat.icon && (
              <div
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                  stat.iconClassName ?? 'bg-[var(--primary-light)] text-[var(--primary)]'
                }`}
              >
                {stat.icon}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
