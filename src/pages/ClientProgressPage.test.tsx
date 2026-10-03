/**
 * Tests for the client progress empty period.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useClientOutlet } from '@/hooks/useClientOutlet'
import { useClientProgress } from '@/hooks/useClientProgress'
import { ClientProgressPage } from './ClientProgressPage'

vi.mock('@/hooks/useClientOutlet', () => ({ useClientOutlet: vi.fn() }))
vi.mock('@/hooks/useClientProgress', () => ({ useClientProgress: vi.fn() }))

describe('ClientProgressPage', () => {
  it('uses hasData to show the empty state even when the report exists', () => {
    vi.mocked(useClientOutlet).mockReturnValue({ client: { id: 'c1' } } as ReturnType<typeof useClientOutlet>)
    vi.mocked(useClientProgress).mockReturnValue({
      report: { hasData: false, adherencePercentage: 0, scheduled: 0, completed: 0, partial: 0, skipped: 0, exercises: [] },
      isLoading: false, error: null, refetch: vi.fn(), weeks: 8, setWeeks: vi.fn(), exerciseId: '', setExerciseId: vi.fn(), chart: null,
    } as ReturnType<typeof useClientProgress>)

    render(<ClientProgressPage />)

    expect(screen.getByText('Sin datos en el periodo')).toBeInTheDocument()
  })
})
