/**
 * Search and status filter of the clients list.
 *
 * @author Melina
 * @packageDocumentation
 */

import { FilterBar, FilterField } from '@/components/layout'
import { SelectField, type SelectOption, TextField } from '@/components/ui'
import type { ClientStatusFilter } from '@/types/client'

/** Options of the status filter. */
const statusOptions: SelectOption<ClientStatusFilter>[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INVITED', label: 'Código enviado' },
  { value: 'INVITATION_EXPIRED', label: 'Código vencido' },
  { value: 'INACTIVE', label: 'Inactivos' },
]

/**
 * Props accepted by {@link ClientFilters}.
 */
export interface ClientFiltersProps {
  /** Text of the search field. */
  query: string
  /** Selected status. */
  status: ClientStatusFilter
  /** Called with the new search text. */
  onQueryChange: (value: string) => void
  /** Called with the status the user selects. */
  onStatusChange: (value: ClientStatusFilter) => void
}

/**
 * Shows the search field and the status filter of the clients list, and reports their changes.
 */
export function ClientFilters({ query, status, onQueryChange, onStatusChange }: ClientFiltersProps) {
  return (
    <FilterBar>
      <FilterField grow>
        <TextField
          label="Buscar por nombre"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          leadingIcon="search"
        />
      </FilterField>
      <FilterField>
        <SelectField label="Estado" value={status} options={statusOptions} onChange={onStatusChange} />
      </FilterField>
    </FilterBar>
  )
}
