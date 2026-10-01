/**
 * Class name helper that understands the design tokens.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge does not know the custom tokens. Registering them keeps, for example, `text-title`
// (font size) and `text-content-primary` (color) from being treated as the same utility.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-xl',
        'display',
        'headline',
        'title',
        'title-strong',
        'label-l',
        'body-l-strong',
        'body-l',
        'label-m',
        'label-m-bold',
        'body-m',
        'overline',
        'caption',
      ],
      spacing: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'page-top', 'page-bottom'],
      radius: ['sm', 'md', 'lg'],
      shadow: ['card', 'soft', 'raised', 'floating', 'nav', 'glow-primary', 'glow-secondary'],
    },
  },
})

/**
 * Joins conditional class names and resolves conflicting utilities, keeping the last one.
 *
 * @param inputs - Class names, arrays or objects accepted by `clsx`.
 * @returns The merged class string.
 *
 * @example
 * ```ts
 * cn('p-md', isActive && 'bg-primary', 'p-xl'); // 'bg-primary p-xl'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
