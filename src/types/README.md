# `types/` — Tipos compartidos

Definiciones de **TypeScript compartidas** entre capas: modelos del dominio, DTO de la API y tipos
del design system.

## Contenido base

| Archivo | Uso |
|---|---|
| `ui.ts` | Variantes del design system (`ButtonVariant`, `BadgeTone`, `TextVariant`…). Mismo contenido en web y mobile, para que ambos expongan la misma API de componentes. |
| `env.d.ts` | Tipos de las variables de entorno de Vite (`VITE_API_URL`). |
| `auth.ts` | Sesión del entrenador: usuario, roles y datos de los formularios de acceso. |
| `client.ts` | Cliente, ficha física, rutina vigente y código de activación. |
| `exercise.ts` | Ejercicio del catálogo. |
| `routine.ts` | Rutina, sesiones, versiones y el estado del formulario de rutina. |
| `workout.ts` | Entrenamiento registrado, reporte de progreso y evolución. |

## Reglas

- Solo tipos (`type` / `interface`); sin lógica.
- Un archivo por dominio: `client.ts`, `routine.ts`, `workout.ts`…
- Los tipos que solo usa un componente se declaran en su archivo (p. ej. `ButtonProps`).

## Ejemplo

```ts
export interface Client {
  id: string
  fullName: string
  status: 'ACTIVE' | 'INACTIVE'
}
```
