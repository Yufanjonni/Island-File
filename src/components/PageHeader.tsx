import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  )
}
