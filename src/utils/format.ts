/**
 * Formatting helpers for dates, weights and counts shown in the interface.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const WEEKDAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/**
 * Layouts available for a formatted date.
 *
 * @remarks
 * - `day`: `15 sep`.
 * - `short`: `15 sep 2026`.
 * - `long`: `15 de septiembre de 2026`.
 * - `weekday`: `Mar 15 sep 2026`.
 * - `full`: `Martes 15 de septiembre de 2026`.
 */
export type DateStyle = 'day' | 'short' | 'long' | 'weekday' | 'full'

/**
 * Parses a date sent by the backend.
 *
 * @remarks
 * A date without time (`YYYY-MM-DD`) is read as a local day, not as midnight UTC, so it never
 * shifts to the previous day.
 *
 * @param value - Date in `YYYY-MM-DD` or ISO 8601 format.
 * @returns The parsed date, or `null` when the value is empty or not a date.
 *
 * @example
 * ```ts
 * parseDate('2026-09-15')?.getDate(); // 15
 * ```
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const dayOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dayOnly
    ? new Date(Number(dayOnly[1]), Number(dayOnly[2]) - 1, Number(dayOnly[3]))
    : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formats a date in Spanish.
 *
 * @param value - Date in `YYYY-MM-DD` or ISO 8601 format.
 * @param style - Layout of the result.
 * @returns The formatted date, or an empty string when the value is not a date.
 *
 * @example
 * ```ts
 * formatDate('2026-09-15', 'long'); // '15 de septiembre de 2026'
 * ```
 */
export function formatDate(value: string | null | undefined, style: DateStyle = 'short'): string {
  const date = parseDate(value)
  if (!date) return ''
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  switch (style) {
    case 'day':
      return `${day} ${MONTHS_SHORT[month]}`
    case 'long':
      return `${day} de ${MONTHS_LONG[month]} de ${year}`
    case 'weekday':
      return `${WEEKDAYS_SHORT[date.getDay()]} ${day} ${MONTHS_SHORT[month]} ${year}`
    case 'full':
      return `${WEEKDAYS_LONG[date.getDay()]} ${day} de ${MONTHS_LONG[month]} de ${year}`
    default:
      return `${day} ${MONTHS_SHORT[month]} ${year}`
  }
}

/**
 * Formats the time of a date in 24-hour format, without a leading zero in the hour.
 *
 * @param value - Date and time in ISO 8601 format.
 * @returns The formatted time, or an empty string when the value is not a date.
 *
 * @example
 * ```ts
 * formatTime('2026-09-16T07:05:00'); // '7:05'
 * ```
 */
export function formatTime(value: string | null | undefined): string {
  const date = parseDate(value)
  if (!date) return ''
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Formats a date followed by its time.
 *
 * @param value - Date and time in ISO 8601 format.
 * @param style - Layout of the date part.
 * @returns The formatted date and time, or an empty string when the value is not a date.
 *
 * @example
 * ```ts
 * formatDateTime('2026-09-01T09:15:00'); // '1 sep 2026, 9:15'
 * ```
 */
export function formatDateTime(value: string | null | undefined, style: DateStyle = 'short'): string {
  const date = formatDate(value, style)
  return date ? `${date}, ${formatTime(value)}` : ''
}

/**
 * Formats a number with a space between thousands and a decimal comma.
 *
 * @param value - Number to format.
 * @param decimals - Decimal places to keep.
 * @returns The formatted number.
 *
 * @example
 * ```ts
 * formatNumber(3625); // '3 625'
 * formatNumber(78, 1); // '78,0'
 * ```
 */
export function formatNumber(value: number, decimals = 0): string {
  const [integer, fraction] = Math.abs(value).toFixed(decimals).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const sign = value < 0 ? '-' : ''
  return fraction ? `${sign}${grouped},${fraction}` : `${sign}${grouped}`
}

/**
 * Formats a weight in kilograms with its unit.
 *
 * @param value - Weight in kilograms.
 * @param decimals - Decimal places to keep; by default one only when the value is not whole.
 * @returns The formatted weight.
 *
 * @example
 * ```ts
 * formatKg(3625); // '3 625 kg'
 * formatKg(12.5); // '12,5 kg'
 * ```
 */
export function formatKg(value: number, decimals = Number.isInteger(value) ? 0 : 1): string {
  return `${formatNumber(value, decimals)} kg`
}

/**
 * Formats a count followed by the singular or plural noun.
 *
 * @param count - Number of items.
 * @param singular - Noun used for exactly one item.
 * @param plural - Noun used for any other count.
 * @returns The count and the matching noun.
 *
 * @example
 * ```ts
 * formatCount(1, 'rutina', 'rutinas'); // '1 rutina'
 * formatCount(3, 'rutina', 'rutinas'); // '3 rutinas'
 * ```
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * Returns the first word of a full name, used to address a person.
 *
 * @param fullName - Full name of the person.
 * @returns The first name.
 *
 * @example
 * ```ts
 * firstName('Diego Paredes'); // 'Diego'
 * ```
 */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}

/**
 * Returns today's date in the format used by date inputs and by the backend.
 *
 * @param now - Date to format; defaults to the current moment.
 * @returns The date in `YYYY-MM-DD` format, in local time.
 *
 * @example
 * ```ts
 * toIsoDate(new Date(2026, 8, 21)); // '2026-09-21'
 * ```
 */
export function toIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
