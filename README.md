# FormAI Web App

## Summary

**FormAI** es una plataforma de seguimiento de entrenamientos personalizados en gimnasios que conecta
a **entrenadores personales** con sus **clientes**. Centraliza la gestión de la cartera de atletas, la
prescripción de rutinas y el registro en tiempo real de lo que se ejecuta, y reemplaza las hojas de
cálculo y los chats informales. Su diferenciador es un módulo de **IA que reconoce máquinas de gimnasio
por foto** y muestra guías de uso animadas.

Este repositorio es la **aplicación web (SPA)**. La usan:

- **Entrenadores**: gestionan clientes, ejercicios y rutinas, y supervisan el progreso.
- **Administrador** (rol interno `ADMIN`): mantiene el catálogo de máquinas y los parámetros del modelo de IA.

### Ecosistema FormAI

| Repositorio | Qué es | Quién lo usa |
|---|---|---|
| `formai-web-app` (este) | SPA React servida por Caddy | Entrenador · Administrador |
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

- Registro, inicio de sesión y recuperación de contraseña por correo.
- Gestión de clientes: alta con código de activación (vigencia de 72 h), listado paginado, búsqueda, filtro por estado, edición y desactivación conservando el historial.
- Ficha física del cliente: objetivo, estatura, historial de peso y restricciones o lesiones.
- Catálogo propio de ejercicios: crear, editar, archivar y restaurar, con grupo muscular.
- Rutinas: borradores con sesiones y ejercicios prescritos (series, repeticiones, carga objetivo, descansos), duplicado, versionado automático y asignación a clientes con fecha de inicio.
- Supervisión en tiempo real de los entrenamientos registrados y de las métricas de progreso (adherencia, volumen, historial).
- Vinculación de ejercicios propios con máquinas del catálogo general.
- Reporte de uso de IA: escaneos de máquinas, reproducciones de guías y máquinas marcadas como inestables.

**Rol Administrador**

- Acceso interno sin visibilidad de datos personales de clientes.
- Catálogo de 10–15 máquinas con fotos de referencia, animación MP4 (≤ 30 s) y póster.
- Borradores de pasos clave y errores comunes generados por LLM, con revisión y aprobación humana antes de publicar.
- Ajuste del umbral de confianza del modelo (0,70 inicial) sin actualizar la app móvil.
- Tablero de precisión por máquina (Top-1 / Top-3, correcciones, candidatas a reentrenamiento con < 80 % de acierto).

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
