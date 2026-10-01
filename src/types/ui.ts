/**
 * Variant types of the design system, shared by the web and mobile apps so both expose the same
 * component API.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Ligature name of a Material Symbols Rounded icon, such as `bolt` or `check_circle`.
 */
export type IconName = string

/**
 * Icon sizes, in pixels, defined by the design system.
 */
export type IconSize = 16 | 20 | 24

/**
 * Typography styles of the design system.
 *
 * @remarks
 * Each value maps to a text style of the design file and sets size, line height and tracking.
 */
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
 * Text colors available for the `Text` component.
 *
 * @remarks
 * - `default`: main text color.
 * - `secondary`, `muted`, `subtle`: decreasing emphasis.
 * - `on-primary`, `on-inverse`: text placed over a primary or inverse surface.
 * - `primary`, `primary-bright`: brand color.
 * - `accent`, `tertiary`, `error`: semantic colors.
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

/**
 * Visual styles available for a button.
 *
 * @remarks
 * - `primary`: main action of the view.
 * - `accent`: highlighted action that competes with nothing else on screen.
 * - `secondary`: alternative action with less emphasis.
 * - `ghost`: low-emphasis action without a container.
 * - `danger`: destructive action.
 */
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'

/**
 * Height and padding presets of a button: `lg` 56 px, `md` 48 px, `sm` 32 px.
 */
export type ButtonSize = 'lg' | 'md' | 'sm'

/**
 * Visual styles available for an icon button.
 *
 * @remarks
 * - `tonal`: tinted container, for actions over the page background.
 * - `surface`: elevated white container, for actions over media.
 */
export type IconButtonVariant = 'tonal' | 'surface'

/**
 * Color tones available for a badge.
 */
export type BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'strong'

/**
 * Color tones available for a section label.
 */
export type SectionLabelTone = 'primary' | 'secondary' | 'neutral'

/**
 * Shadow levels available for a surface.
 */
export type Elevation = 'none' | 'card' | 'soft' | 'raised' | 'floating'

/**
 * Fill styles of a progress bar: a solid primary color or a primary-to-secondary gradient.
 */
export type ProgressTone = 'primary' | 'gradient'

/**
 * Kinds of message a toast can show.
 */
export type ToastTone = 'info' | 'success' | 'error'

/**
 * Kinds of confirmation dialog: a regular confirmation or a destructive one.
 */
export type DialogTone = 'default' | 'danger'

/**
 * Kinds of callout: informative or warning.
 */
export type CalloutTone = 'info' | 'warning'

/**
 * Avatar sizes: `sm` 32 px, `md` 48 px.
 */
export type AvatarSize = 'sm' | 'md'

/**
 * Describes one option of a segmented control.
 *
 * @typeParam T - Union of the option values.
 */
export interface SegmentOption<T extends string = string> {
  /** Text shown for the option. */
  label: string
  /** Value reported when the option is selected. */
  value: T
}
