import { SelectField } from '@/components/ui'
import type { ExerciseStatus } from '@/types/exercise'

const statusOptions = [
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'ARCHIVED', label: 'Archivados' },
] satisfies { value: ExerciseStatus; label: string }[]

export interface ExerciseFiltersProps {
  status: ExerciseStatus
  onStatusChange: (value: ExerciseStatus) => void
}

export function ExerciseFilters({ status, onStatusChange }: ExerciseFiltersProps) {
  return (
    <div className="flex w-full justify-end">
      <SelectField
        label="Estado"
        value={status}
        options={statusOptions}
        onChange={onStatusChange}
        className="w-full sm:w-[240px]"
      />
    </div>
  )
}
