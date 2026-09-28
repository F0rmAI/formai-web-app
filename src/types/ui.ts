/**
 * Tipos del design system de FormAI.
 * Mismo contenido en formai-web-app y formai-mobile-app: los componentes
 * de ambas plataformas exponen exactamente las mismas variantes.
 */

/** Nombre de ligadura de Material Symbols Rounded (p. ej. "bolt", "check_circle"). */
export type IconName = string

export type IconSize = 16 | 20 | 24

/** Estilos tipográficos FormAI/* de Figma. */
export type TextVariant =
  | 'display-xl'
  | 'display'
  | 'headline'
  | 'title'
  | 'title-strong'
  | 'label-l'
  | 'body-l-strong'
  | 'body-l'
  | 'label-m'
  | 'label-m-bold'
  | 'body-m'
  | 'overline'
  | 'caption'

/**
 * Color de texto. `default` = text/primary de Figma (el color principal de texto);
 * `primary` = color de marca (primary/base).
 */
export type TextTone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'subtle'
  | 'on-primary'
  | 'on-inverse'
  | 'primary'
  | 'primary-bright'
  | 'accent'
  | 'tertiary'
  | 'error'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'

export type ButtonSize = 'lg' | 'md' | 'sm'

export type IconButtonVariant = 'tonal' | 'surface'

export type BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'strong'

export type SectionLabelTone = 'primary' | 'secondary' | 'neutral'

export type Elevation = 'none' | 'card' | 'soft' | 'raised' | 'floating'

export type ProgressTone = 'primary' | 'gradient'

export type ToastTone = 'info' | 'success' | 'error'

export type DialogTone = 'default' | 'danger'

export type CalloutTone = 'info' | 'warning'

export type AvatarSize = 'sm' | 'md'

export interface SegmentOption<T extends string = string> {
  label: string
  value: T
}
