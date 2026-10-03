/**
 * Spanish labels for the weekdays accepted by the assignment API.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { TrainingDay } from '@/types/routine'

/** Weekdays in the order returned by the backend. */
export const TRAINING_DAYS: readonly { day: TrainingDay; label: string }[] = [
  { day: 'MONDAY', label: 'Lun' },
  { day: 'TUESDAY', label: 'Mar' },
  { day: 'WEDNESDAY', label: 'Mié' },
  { day: 'THURSDAY', label: 'Jue' },
  { day: 'FRIDAY', label: 'Vie' },
  { day: 'SATURDAY', label: 'Sáb' },
  { day: 'SUNDAY', label: 'Dom' },
]

/** Formats chosen weekdays as short Spanish labels. */
export function formatTrainingDays(days: TrainingDay[]): string {
  return TRAINING_DAYS.filter(({ day }) => days.includes(day)).map(({ label }) => label).join(', ')
}
