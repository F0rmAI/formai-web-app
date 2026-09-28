import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge no conoce los tokens propios de tokens.css; se registran aquí para
 * que, por ejemplo, `text-title` (tamaño) y `text-content-primary` (color) no se
 * consideren la misma utilidad y una no elimine a la otra.
 */
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

/** Une clases condicionales y resuelve conflictos de Tailwind (la última gana). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
