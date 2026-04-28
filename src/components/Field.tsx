import * as Label from '@radix-ui/react-label'
import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="field">
      <Label.Root>{label}</Label.Root>
      {children}
    </div>
  )
}
