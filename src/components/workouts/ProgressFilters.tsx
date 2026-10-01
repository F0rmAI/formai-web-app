import { SelectField } from '@/components/ui'
import type { ProgressPeriod } from '@/hooks/useClientProgress'

const periodOptions = [
  { value: '30d', label: 'Últimos 30 días' },
  { value: '8w', label: 'Últimas 8 semanas' },
  { value: '12w', label: 'Últimas 12 semanas' },
] satisfies { value: ProgressPeriod; label: string }[]

export interface ProgressFiltersProps {
  period: ProgressPeriod
  onPeriodChange: (value: ProgressPeriod) => void
  exerciseId: string
  exerciseOptions: { value: string; label: string }[]
  onExerciseChange: (value: string) => void
}

export function ProgressFilters({
  period,
  onPeriodChange,
  exerciseId,
  exerciseOptions,
  onExerciseChange,
}: ProgressFiltersProps) {
  const options =
    exerciseOptions.length > 0
      ? exerciseOptions
      : [{ value: '', label: 'Sin ejercicios en el periodo' }]

  return (
    <div className="grid grid-cols-1 items-end gap-xl sm:grid-cols-2">
      <SelectField label="Periodo" value={period} options={periodOptions} onChange={onPeriodChange} icon="date_range" />
      <SelectField
        label="Ejercicio"
        value={exerciseId || options[0]?.value || ''}
        options={options}
        onChange={onExerciseChange}
        icon="fitness_center"
        disabled={exerciseOptions.length === 0}
      />
    </div>
  )
}
