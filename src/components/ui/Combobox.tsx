/**
 * Multi-select combobox primitive of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'
import { Chip } from './Chip'
import { Icon } from './Icon'
import { Text } from './Text'

/**
 * Describes one option of a combobox.
 */
export interface ComboboxOption {
  /** Value reported when the option is selected. */
  value: string
  /** Text shown for the option; the search matches it. */
  label: string
  /** Secondary text shown under the label. */
  description?: string
}

/**
 * Props accepted by {@link Combobox}.
 */
export interface ComboboxProps {
  /** Label shown above the field. */
  label: string
  /** Options to choose from, in order. */
  options: ComboboxOption[]
  /** Values of the selected options. */
  value: string[]
  /** Called with the new list of selected values. */
  onChange: (value: string[]) => void
  /**
   * Hint shown in the empty search field.
   *
   * @defaultValue `'Buscar'`
   */
  placeholder?: string
  /**
   * Message shown when no option matches the search.
   *
   * @defaultValue `'Sin resultados'`
   */
  emptyMessage?: string
  /** Extra classes for layout adjustments from the parent. */
  className?: string
}

/** Lowercases and drops accents, so a search typed without accents still matches accented names. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/**
 * Renders a search field that opens a list of options to tick several of them, and shows the
 * selected ones as removable chips under the field.
 *
 * @remarks
 * Follows the ARIA combobox pattern with a multi-selectable listbox: arrow keys move through the
 * options, Enter ticks or unticks the active one and Escape closes the list. The list grows in the
 * page flow instead of floating, so it also works inside a modal.
 *
 * @example
 * ```tsx
 * <Combobox label="Clientes" options={clientOptions} value={selectedIds} onChange={setSelectedIds} />
 * ```
 */
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Buscar',
  emptyMessage = 'Sin resultados',
  className,
}: ComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState(0)

  const matches = options.filter((option) => normalize(option.label).includes(normalize(query.trim())))
  const activeIndex = Math.min(active, matches.length - 1)
  const selected = options.filter((option) => value.includes(option.value))
  const optionId = (index: number) => `${id}-option-${index}`

  const toggle = (optionValue: string) =>
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActive(Math.min(activeIndex + 1, matches.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(activeIndex - 1, 0))
    } else if (event.key === 'Enter' && isOpen && matches[activeIndex]) {
      event.preventDefault()
      toggle(matches[activeIndex].value)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div
      className={cn('flex w-full flex-col gap-sm', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <label htmlFor={id}>
        <Text as="span" variant="label-m-bold" tone="secondary">
          {label}
        </Text>
      </label>
      <div className="flex h-12 items-center rounded-md border border-line-outline bg-surface-card px-xl focus-within:border-[1.5px] focus-within:border-primary">
        <Icon name="search" size={20} className="text-content-muted" />
        <input
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && matches[activeIndex] ? optionId(activeIndex) : undefined}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent px-md text-body-l text-content-primary outline-none placeholder:text-content-muted"
        />
        <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={20} className="text-content-muted" />
      </div>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable
          aria-label={label}
          className="max-h-[240px] overflow-y-auto rounded-md border border-line-outline bg-surface-card py-sm shadow-card"
        >
          {matches.length === 0 ? (
            <li className="px-xl py-md">
              <Text as="span" variant="body-m" tone="secondary">
                {emptyMessage}
              </Text>
            </li>
          ) : (
            matches.map((option, index) => {
              const isSelected = value.includes(option.value)
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  // Keeps the focus in the search field, so the list stays open while ticking.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => toggle(option.value)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    'flex cursor-pointer items-start gap-lg px-xl py-md',
                    index === activeIndex && 'bg-surface-container',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-[2px] flex size-[22px] shrink-0 items-center justify-center rounded-sm',
                      isSelected ? 'bg-primary' : 'border-[1.5px] border-line-outline bg-surface-card',
                    )}
                  >
                    {isSelected && <Icon name="check" size={16} className="text-content-on-primary" />}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <Text as="span" variant="body-l">
                      {option.label}
                    </Text>
                    {/* Separates label and description in the option's accessible name. */}
                    {option.description && ' '}
                    {option.description && (
                      <Text as="span" variant="body-m" tone="secondary">
                        {option.description}
                      </Text>
                    )}
                  </span>
                </li>
              )
            })
          )}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-sm">
          {selected.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              icon="close"
              selected
              aria-pressed={undefined}
              aria-label={`Quitar ${option.label}`}
              onClick={() => toggle(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
