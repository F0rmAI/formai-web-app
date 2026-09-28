import type { ImgHTMLAttributes } from 'react'
import brandLogo from '@/assets/brand-logo.png'
import { cn } from '@/utils/cn'

export type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

/** Isotipo de FormAI (32 px). */
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
