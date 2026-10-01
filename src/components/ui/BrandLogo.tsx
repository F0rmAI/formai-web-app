/**
 * Brand logo primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import type { ImgHTMLAttributes } from 'react'
import brandLogo from '@/assets/brand-logo.png'
import { cn } from '@/utils/cn'

/**
 * Props accepted by {@link BrandLogo}.
 */
export type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

/**
 * Renders the product logo mark at 32 px.
 *
 * @example
 * ```tsx
 * <BrandLogo />
 * ```
 */
export function BrandLogo({ alt = 'FormAI', className, ...props }: BrandLogoProps) {
  return (
    <img
      src={brandLogo}
      alt={alt}
      width={32}
      height={32}
      className={cn('size-8 shrink-0 rounded-sm object-cover', className)}
      {...props}
    />
  )
}
