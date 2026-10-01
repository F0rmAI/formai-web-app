import type { ReactNode } from 'react'
import authHero from '@/assets/auth-hero-v2.jpg'
import { BrandLogo, Text } from '@/components/ui'

const BRAND_HEADLINE = 'Tus clientes, sus rutinas y su progreso en un solo lugar.'
const BRAND_BODY = 'Crea planes, asígnalos y revisa cada serie que registran desde su app.'

interface AuthLayoutProps {
  children: ReactNode
}

/** Layout split auth: panel de marca + formulario centrado. */
export function AuthLayout({ children }: AuthLayoutProps) {
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
          <Text as="h1" variant="display" tone="on-primary">
            {BRAND_HEADLINE}
          </Text>
          <Text variant="body-l" tone="on-inverse">
            {BRAND_BODY}
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
