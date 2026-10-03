/**
 * Layout of the pages shown without a session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type { ReactNode } from 'react'
import authHero from '@/assets/auth-hero-v2.jpg'
import { BrandLogo, Text } from '@/components/ui'

/**
 * Props accepted by {@link AuthLayout}.
 */
export interface AuthLayoutProps {
  /** Form or message shown in the content column. */
  children: ReactNode
  /**
   * Headline of the brand panel.
   *
   * @defaultValue `'Tus clientes, sus rutinas y su progreso en un solo lugar.'`
   */
  headline?: string
  /**
   * Supporting text of the brand panel.
   *
   * @defaultValue `'Crea planes, asígnalos y revisa cada serie que registran desde su app.'`
   */
  description?: string
}

/**
 * Renders the split layout of the access pages: a brand panel and a centered content column.
 *
 * @remarks
 * Mobile-first: only the content column with the brand on top on small screens; the brand panel
 * appears from the `lg` breakpoint.
 *
 * @example
 * ```tsx
 * <AuthLayout>
 *   <LoginForm />
 * </AuthLayout>
 * ```
 */
export function AuthLayout({
  children,
  headline = 'Tus clientes, sus rutinas y su progreso en un solo lugar.',
  description = 'Crea planes, asígnalos y revisa cada serie que registran desde su app.',
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full bg-surface-background">
      <aside className="hidden w-[560px] shrink-0 flex-col justify-between bg-primary p-14 lg:flex">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <Text as="span" variant="headline" tone="on-primary">
            FormAI
          </Text>
        </div>

        <img
          src={authHero}
          alt=""
          width={1152}
          height={864}
          decoding="async"
          className="h-[360px] w-full rounded-md object-cover shadow-card"
        />

        <div className="flex flex-col gap-md">
          <Text as="p" variant="display" tone="on-primary">
            {headline}
          </Text>
          <Text variant="body-l" tone="on-inverse">
            {description}
          </Text>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-xl py-2xl">
        <div className="mb-2xl flex items-center gap-3 lg:hidden">
          <BrandLogo />
          <Text as="span" variant="headline">
            FormAI
          </Text>
        </div>
        <div className="flex w-full max-w-[400px] flex-col gap-xl">{children}</div>
      </main>
    </div>
  )
}
