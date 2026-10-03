/**
 * Stat card primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { IconName, SectionLabelTone } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Badge } from './Badge'
import { Card } from './Card'
import { Icon } from './Icon'
import { Text } from './Text'

/** Classes of the icon tile for each tone. */
const toneClass: Record<Exclude<SectionLabelTone, 'neutral'>, { tile: string; icon: string }> = {
  primary: { tile: 'bg-primary-container', icon: 'text-primary' },
  secondary: { tile: 'bg-secondary-container', icon: 'text-secondary' },
}

/**
 * Props accepted by {@link StatCard}.
 */
export interface StatCardProps {
  /** Name of the metric. */
  label: string
  /** Value of the metric, already formatted. */
  value: string
  /** Unit shown next to the value. */
  unit?: string
  /** Supporting text shown below the value. */
  caption?: string
  /** Icon shown in the tile. */
  icon: IconName
  /**
   * Color of the tile and of the change badge.
   *
   * @defaultValue `'primary'`
   */
  tone?: Exclude<SectionLabelTone, 'neutral'>
  /** Change of the metric, already formatted, shown as a badge. */
  change?: string
  /** Icon of the change badge. */
  changeIcon?: IconName
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/**
 * Renders one metric with its icon, its value and how much it changed.
 *
 * @example
 * ```tsx
 * <StatCard label="Max load" value="34" unit="kg" icon="military_tech" change="+4 kg" changeIcon="trending_up" />
 * ```
 */
export function StatCard({
  label,
  value,
  unit,
  caption,
  icon,
  tone = 'primary',
  change,
  changeIcon,
  className,
}: StatCardProps) {
  const styles = toneClass[tone]

  return (
    <Card className={cn('flex flex-col gap-md', className)}>
      <div className="flex items-center justify-between gap-md">
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', styles.tile)}>
          <Icon name={icon} size={20} className={styles.icon} />
        </span>
        {change && <Badge label={change} icon={changeIcon} tone={tone} />}
      </div>
      <Text tone="secondary">{label}</Text>
      <div className="flex items-baseline gap-xs">
        <Text as="span" variant="display-xl">
          {value}
        </Text>
        {unit && (
          <Text as="span" variant="label-l">
            {unit}
          </Text>
        )}
      </div>
      {caption && (
        <Text variant="body-m" tone="muted">
          {caption}
        </Text>
      )}
    </Card>
  )
}
