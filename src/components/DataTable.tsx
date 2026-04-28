import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  label: string
  render: (item: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  emptyText?: string
  actions?: (item: T) => ReactNode
}

export function DataTable<T>({ columns, data, emptyText = 'Data tidak ditemukan.', actions }: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(item)}</td>
              ))}
              {actions && <td>{actions(item)}</td>}
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)}>{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
