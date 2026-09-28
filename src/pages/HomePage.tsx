import { Button, Text } from '@/components/ui'
import { useCounter } from '@/hooks/useCounter'

/**
 * Pantalla inicial de la base del proyecto: verifica que Tailwind, los tokens,
 * la tipografía, los íconos y los componentes del design system funcionan.
 */
export function HomePage() {
  const { count, increment } = useCounter()

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-background p-xl">
      <div className="flex flex-col items-center gap-2xl">
        <Text as="h1" variant="display-xl" tone="primary">
          FormAI
        </Text>
        <div className="flex flex-col items-center gap-xl">
          <Text variant="display" aria-live="polite">
            {count}
          </Text>
          <Button label="Incrementar" icon="add" onClick={increment} />
        </div>
      </div>
    </main>
  )
}
