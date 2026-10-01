import { SegmentedControl } from '@/components/ui'
import type { RoutineStatusFilter } from '@/types/routine'

const statusOptions = [
  { value: 'ALL', label: 'Todas' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'CLOSED', label: 'Cerrada' },
] satisfies { value: RoutineStatusFilter; label: string }[]

export interface RoutineFiltersProps {
  status: RoutineStatusFilter
  onStatusChange: (value: RoutineStatusFilter) => void
}

export function RoutineFilters({ status, onStatusChange }: RoutineFiltersProps) {
  return (
    <div className="overflow-x-auto pb-xs">
      <SegmentedControl
        label="Estado de rutina"
        options={statusOptions}
        value={status}
        onChange={onStatusChange}
      />
    </div>
  )
}
