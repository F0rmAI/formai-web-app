/**
 * Tests for the class name helper.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('flex', false, undefined, 'gap-md')).toBe('flex gap-md')
  })

  it('keeps the last utility when two conflict', () => {
    expect(cn('p-md', 'p-xl')).toBe('p-xl')
  })

  it('keeps a text size token together with a text color token', () => {
    expect(cn('text-title', 'text-content-primary')).toBe('text-title text-content-primary')
  })

  it('replaces a text color token with a later one', () => {
    expect(cn('text-content-primary', 'text-primary')).toBe('text-primary')
  })
})
