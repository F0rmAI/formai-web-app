# FormAI Web App

## Summary

**FormAI** es una plataforma de seguimiento de entrenamientos personalizados en gimnasios que conecta
a **entrenadores personales** con sus **clientes**. Centraliza la gestión de la cartera de atletas, la
prescripción de rutinas y el seguimiento de lo que se ejecuta, y reemplaza las hojas de
cálculo y los chats informales. Para TB2 está previsto un módulo de **IA que reconoce máquinas de gimnasio
por foto** y muestra guías de uso animadas.

Este repositorio es la **aplicación web (SPA)**. En esta entrega la usa:

- **Entrenadores**: gestionan clientes, ejercicios y rutinas, y supervisan el progreso.

### Ecosistema FormAI

| Repositorio | Qué es | Quién lo usa |
|---|---|---|
| `formai-web-app` (este) | SPA React servida por Caddy | Entrenador |
| `formai-mobile-app` | App React Native (iOS/Android) | Cliente / atleta |
| `formai-api` | Backend Spring Boot (monolito modular DDD) | Ambas apps vía `/api` |

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| UI | React + React DOM | **19.3.0** |
| Build / dev server | Vite (`@vitejs/plugin-react`) | 8.3 |
| Estilos | Tailwind CSS (`@tailwindcss/vite`, configuración CSS-first) | **4.3.3** |
| Lenguaje | TypeScript | 6.0 |
| Lint | oxlint | 1.x |
| Tests | Vitest + Testing Library (entorno jsdom) | 5.0 / 16.3 |
| Tipografía | Plus Jakarta Sans Variable (`@fontsource-variable`) | 5.3 |
| Íconos | Material Symbols Rounded, peso 400 (`@material-symbols/font-400`) | 0.47 |
| Utilidades de clases | `clsx` + `tailwind-merge` | 2.1 / 3.7 |
| Backend (contexto) | Spring Boot · PostgreSQL · Caddy (HTTPS, `/api`, `/media`) | — |

## Features

**Rol Entrenador**

- Registro, inicio de sesión y recuperación de contraseña por correo. La sesión usa cookies `httpOnly`: el token de acceso dura 30 minutos y se renueva de forma transparente. Se restaura tras recargar la página o abrir otra pestaña; también se puede cerrar sesión.
- Gestión de clientes: alta solo con nombre y código de activación válido por 72 horas (el cliente elige su correo al activar la cuenta en la app móvil). El código se puede regenerar para cualquier cliente invitado. Listado con búsqueda y filtro por estado, hasta 100 clientes por carga y sin paginación en la interfaz; cambio de nombre y desactivación conservando el historial.
- Ficha física del cliente: objetivo, estatura, peso con historial y restricciones o lesiones; días de entrenamiento e historial de asignaciones.
- Catálogo propio de ejercicios: crear, archivar y restaurar, con grupo muscular; eliminar si ninguna rutina usa el ejercicio.
- Rutinas: creación con sesiones y ejercicios prescritos (series, repeticiones, carga objetivo, descansos), duplicado, edición como nueva versión e historial de versiones. Asignación a clientes activos con fecha de inicio y días de entrenamiento; reemplazo de una rutina vigente y reasignación de una cerrada.
- Seguimiento de entrenamientos por cliente: sesiones con detalle por serie, informe de adherencia y gráfico de carga y volumen por ejercicio.

**Planned for TB2 (incremento final)**

- Rol Administrador, catálogo de máquinas, vinculación de ejercicios con máquinas y reporte de reconocimiento por IA.

## Arquitectura

```
src/
├── components/   ui/ (design system) + layout/ (AppShell, Sidebar, Table…) + una carpeta por funcionalidad
├── pages/        páginas completas
├── hooks/        estado y casos de uso de la UI
├── services/     acceso al backend (apiClient)
├── context/      estado global (sesión)
├── navigation/   rutas (ROUTES), guards y árbol de rutas
├── utils/        funciones puras (cn, format, validation…)
├── types/        tipos compartidos
├── assets/       imágenes estáticas (isotipo)
├── tokens.css    design tokens de FormAI (idéntico en web y mobile)
├── global.css    Tailwind + tokens + fuentes
├── main.tsx      punto de entrada (createRoot)
└── App.tsx
```

```
App ──► Pages ──► Components
          │
          ▼
        Hooks ──► Services ──► Backend/API
```

Cada carpeta tiene un `README.md` que explica para qué sirve la capa, qué va y qué no, y un ejemplo:
[components](src/components/README.md) · [pages](src/pages/README.md) · [hooks](src/hooks/README.md) ·
[services](src/services/README.md) · [context](src/context/README.md) · [utils](src/utils/README.md) ·
[types](src/types/README.md) · [navigation](src/navigation/README.md).

## Design system

- Fuente: Figma **FormAI › `formai_design_system`** (Foundations + Components).
- `src/tokens.css` define los tokens como variables `@theme` de Tailwind v4: colores (`bg-primary`, `text-content-secondary`, `border-line-subtle`…), tipografía (`text-title`, `text-body-l`…), radios (`rounded-md`), espaciado (`p-xl`, `gap-md`) y elevación (`shadow-card`, `shadow-glow-primary`). Se reinicia la paleta por defecto de Tailwind: solo existen los colores de FormAI.
- Los componentes de `components/ui` tienen **la misma API que en la app móvil** y usan **`primary` como color por defecto**; el texto, el tono y el ícono se cambian por props.
- Los íconos son Material Symbols Rounded por ligadura: `<Icon name="fitness_center" />`.

## Convenciones de código

- **Mobile-first:** los estilos base son los de la pantalla pequeña y se amplían con `md:` / `lg:`. Sin variantes `max-*`.
- **Documentación TSDoc en inglés:** cada archivo lleva una cabecera con `@packageDocumentation` y `@author`, y todo lo exportado tiene su comentario. `@author` está declarado como tag propio en `tsdoc.json`.
- **Tests junto al archivo** (`*.test.ts(x)`): utilidades, services, hooks, contexto, guards, primitivos con interacción y la página de clientes.

## Primeros pasos

Requisitos: Node.js ≥ 22.

```bash
npm install
cp .env.example .env     # ajusta VITE_API_URL
npm run dev              # http://localhost:5173
```

Al iniciar verás la página de **inicio de sesión**. Con el backend (`formai-api`) en `http://localhost:8080`
puedes crear una cuenta de entrenador y recorrer clientes, ejercicios y rutinas.

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Typecheck (`tsc -b`) + build de producción en `dist/`. |
| `npm run preview` | Sirve el build de producción. |
| `npm run lint` | Lint con oxlint. |
| `npm run typecheck` | Typecheck (`tsc -b`). |
| `npm test` | Tests con Vitest (`npm run test:watch` para modo interactivo). |
