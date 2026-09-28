import { useState } from 'react'
import type { AvatarSize } from '@/types/ui'
import { cn } from '@/utils/cn'
import { Text } from './Text'

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-8',
  md: 'size-12 border-2 border-surface-card shadow-raised',
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export interface AvatarProps {
  /** Nombre de la persona: se usa como texto alternativo y para las iniciales. */
  name: string
  src?: string
  size?: AvatarSize
  className?: string
}

/** Foto de perfil circular. `sm` 32 px (header) o `md` 48 px (saludo). */
export function Avatar({ name, src, size = 'sm', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const showImage = Boolean(src) && src !== failedSrc

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container',
        sizeClass[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src} alt={name} className="size-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <Text as="span" variant={size === 'sm' ? 'label-m-bold' : 'label-l'} tone="primary" aria-label={name}>
          {initialsOf(name)}
        </Text>
      )}
    </span>
  )
}
