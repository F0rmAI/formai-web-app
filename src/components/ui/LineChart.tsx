/**
 * Line chart primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { SectionLabelTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Text } from './Text'

/** Size of the drawing area, in SVG units. */
const WIDTH = 640
const HEIGHT = 180
const PADDING = 8

/** Number of horizontal guide lines. */
const GUIDES = 4

/** Classes of the line and of the legend dot for each tone. */
const toneClass: Record<Exclude<SectionLabelTone, 'neutral'>, { line: string; dot: string }> = {
  primary: { line: 'text-primary-bright', dot: 'bg-primary-bright' },
  secondary: { line: 'text-secondary', dot: 'bg-secondary' },
}

/**
 * Describes one line of a {@link LineChart}.
 */
export interface LineChartSeries {
  /** Name shown in the legend, with its unit. */
  label: string
  /** Values of the line, one per point, oldest first. */
  values: number[]
  /**
   * Color of the line.
   *
   * @defaultValue `'primary'`
   */
  tone?: Exclude<SectionLabelTone, 'neutral'>
}

/**
 * Props accepted by {@link LineChart}.
 */
export interface LineChartProps {
  /** Accessible description of what the chart shows. */
  label: string
  /** Lines of the chart; each one is scaled to its own range so their shapes can be compared. */
  series: LineChartSeries[]
  /** Labels of the horizontal axis, one per point. */
  pointLabels: string[]
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/** Converts the values of one line into the points of an SVG polyline. */
function toPoints(values: number[]): string {
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const step = values.length > 1 ? (WIDTH - PADDING * 2) / (values.length - 1) : 0
  return values
    .map((value, index) => {
      const x = PADDING + index * step
      // Each line uses the middle 70 % of the height so a flat line does not sit on an edge.
      const y = HEIGHT - PADDING - (0.15 + ((value - min) / range) * 0.7) * (HEIGHT - PADDING * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

/**
 * Renders how one or more values evolve over the same points in time.
 *
 * @remarks
 * It needs at least two points per line; with fewer, show an empty state instead.
 *
 * @example
 * ```tsx
 * <LineChart
 *   label="Max load evolution"
 *   series={[{ label: 'Max load (kg)', values: [30, 32, 34] }]}
 *   pointLabels={['W1', 'W2', 'W3']}
 * />
 * ```
 */
export function LineChart({ label, series, pointLabels, className }: LineChartProps) {
  return (
    <div className={cn('flex w-full flex-col gap-xl', className)}>
      <div className="flex flex-wrap gap-xl">
        {series.map((line) => (
          <div key={line.label} className="flex items-center gap-md">
            <span className={cn('size-2 rounded-full', toneClass[line.tone ?? 'primary'].dot)} />
            <Text as="span" variant="label-m-bold" tone="secondary">
              {line.label}
            </Text>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="h-[180px] w-full" preserveAspectRatio="none">
        {Array.from({ length: GUIDES }, (_, index) => {
          const y = PADDING + (index * (HEIGHT - PADDING * 2)) / (GUIDES - 1)
          return (
            <line
              key={index}
              x1={0}
              x2={WIDTH}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="text-line-subtle"
            />
          )
        })}
        {series.map((line) => (
          <polyline
            key={line.label}
            points={toPoints(line.values)}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={toneClass[line.tone ?? 'primary'].line}
          />
        ))}
      </svg>

      <div className="flex justify-between gap-md">
        {pointLabels.map((pointLabel, index) => (
          <Text key={`${pointLabel}-${index}`} as="span" variant="caption" tone="muted">
            {pointLabel}
          </Text>
        ))}
      </div>
    </div>
  )
}
