# `utils/` — Utilidades

Funciones **puras y sin dependencias de React** reutilizables en cualquier capa: formateo,
validaciones, cálculos.

## Contenido base

| Archivo | Uso |
|---|---|
| `cn.ts` | Une clases condicionales (`clsx`) y resuelve conflictos de Tailwind (`tailwind-merge`) conociendo los tokens propios de FormAI. Mismo contenido en web y mobile. |

| `format.ts` | Fechas en español (`formatDate`, `formatDateTime`, `formatTime`), números y pesos (`formatNumber`, `formatKg`), conteos con singular/plural (`formatCount`). |
| `validation.ts` | Validadores de campos de formulario (`emailFormatError`, `passwordError`). |
| `routine-editor.ts` | Construcción, validación y conversión del formulario de rutina. |

## Reglas

- Sin efectos secundarios ni estado; fáciles de testear.
- Nombre descriptivo en camelCase (`formatWeight.ts`, `dates.ts`).
- Si una utilidad solo la usa un componente, puede vivir junto a él.

## Ejemplo

```ts
export const formatKg = (value: number) => `${value.toFixed(1)} kg`
```
