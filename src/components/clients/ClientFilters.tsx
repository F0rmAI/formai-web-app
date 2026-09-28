import { Button, SelectField, TextField } from '@/components/ui'
import type { ClientStatusFilter } from '@/types/client'

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INVITED', label: 'Código enviado' },
  { value: 'INVITATION_EXPIRED', label: 'Código vencido' },
  { value: 'INACTIVE', label: 'Inactivos' },
] satisfies { value: ClientStatusFilter; label: string }[]

export interface ClientFiltersProps {
  query: string
  status: ClientStatusFilter
  onQueryChange: (value: string) => void
  onStatusChange: (value: ClientStatusFilter) => void
  onClear: () => void
}

export function ClientFilters({ query, status, onQueryChange, onStatusChange, onClear }: ClientFiltersProps) {
  const hasFilters = Boolean(query) || status !== 'ALL'

  return (
    <div className="flex flex-col gap-xl">
      <div className="grid grid-cols-1 items-end gap-xl sm:grid-cols-[minmax(0,1fr)_240px]">
        <TextField
          label="Buscar por nombre"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          leadingIcon="search"
        />
        <SelectField
          label="Estado"
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
        />
      </div>
      {hasFilters && (
        <Button
          label="Limpiar búsqueda y filtro"
          icon="close"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="self-start px-0"
        />
      )}
    </div>
  )
}
