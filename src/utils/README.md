# `utils/` — Utilidades

Funciones **puras y sin dependencias de React** reutilizables en cualquier capa: formateo,
validaciones, cálculos.

## Contenido base

| Archivo | Uso |
|---|---|
| `cn.ts` | Une clases condicionales (`clsx`) y resuelve conflictos de Tailwind (`tailwind-merge`) conociendo los tokens propios de FormAI. Mismo contenido en web y mobile. |

## Reglas

- Sin efectos secundarios ni estado; fáciles de testear.
- Nombre descriptivo en camelCase (`formatWeight.ts`, `dates.ts`).
- Si una utilidad solo la usa un componente, puede vivir junto a él.

## Ejemplo

```ts
export const formatKg = (value: number) => `${value.toFixed(1)} kg`
```
