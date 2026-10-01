/**
 * Starter page of the project base.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { Button, Text } from '@/components/ui'
import { useCounter } from '@/hooks/useCounter'

/**
 * Shows the product name and a counter, using {@link useCounter} for the state.
 *
 * @remarks
 * Exists to verify that styles, tokens, fonts, icons and components work. Replace it when the
 * first feature lands.
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
