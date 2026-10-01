# `hooks/` — Hooks personalizados

Contienen la **lógica de estado y de casos de uso** de la UI: llaman a `services/`, manejan carga,
errores y estado local, y exponen a las páginas una API simple.

## Contenido

| Hook | Uso |
|---|---|
| `useAsyncData` | Base de los hooks de lectura: carga con un service, cancela al desmontar y expone `{ data, isLoading, error, refetch }`. |
| `useAsyncAction` | Base de los hooks de escritura: ejecuta una acción, captura el error y expone `{ run, isRunning, error, reset }`. `run` devuelve un `ActionResult`, nunca lanza. |
| `useToast` | Mensajes breves; recoge el que dejó la página anterior en `location.state.toast`. |
| `useLogin`, `useRegister`, `useForgotPassword`, `useResetPassword` | Formularios de acceso. |
| `useClients`, `useClientDetail`, `useClientOutlet` | Listado de clientes, ficha de un cliente y lectura del cliente dentro de sus pestañas. |
| `useClientWorkouts`, `useWorkoutDetail`, `useClientProgress` | Seguimiento de un cliente. |
| `useExercises` | Catálogo de ejercicios. |
| `useRoutines`, `useRoutine`, `useRoutineVersions`, `useRoutineEditor` | Listado, detalle, historial y formulario de rutinas. |

## Reglas

- Nombre `use<Algo>.ts` (camelCase con prefijo `use`), exportado por nombre.
- Pueden usar `services/`, `context/`, `utils/` y `types/`. **Nunca** importan componentes.
- Los de lectura se construyen sobre `useAsyncData` y los de escritura sobre `useAsyncAction`: las páginas y los componentes no llevan `try/catch` de red.
- Devuelven datos listos para pintar y acciones con su estado (`isRegistering`, `registerError`…).
- Una vista que muestra un recurso por id se monta con `key` por recurso, para no mostrar datos del anterior.
- Un hook por caso de uso; si crece, se divide. Cada hook tiene su test.

## Ejemplo

```ts
export function useRoutines() {
  const { data, isLoading, error, refetch } = useAsyncData(routinesService.list, 'No pudimos cargar tus rutinas.')

  return { routines: data ?? [], isLoading, error, refetch }
}
```
