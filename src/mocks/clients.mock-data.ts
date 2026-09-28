import type { ClientDetail } from '@/types/client'

/**
 * Datos exclusivamente de demostración.
 *
 * Ningún componente ni hook debe importar este archivo. Cuando se conecte la
 * API, este módulo se puede eliminar sin afectar la interfaz de usuario.
 */
export const CLIENTS_MOCK_DATA: ClientDetail[] = [
  {
    id: 'diego-paredes',
    fullName: 'Diego Paredes',
    email: 'diego.paredes@correo.com',
    status: 'ACTIVE',
    currentRoutine: 'Hipertrofia · 4 días',
    lastWorkout: 'Mié 16 sep, 7:05',
    activeSince: '1 de septiembre de 2026',
    bodyProfile: {
      goal: 'Hipertrofia',
      weight: 78,
      height: 176,
      restrictions: 'Molestia leve en el hombro derecho',
      updatedAt: '15 sep',
      weightHistory: [
        { date: '15 sep 2026', weight: 78 },
        { date: '1 sep 2026', weight: 79.5 },
        { date: '18 ago 2026', weight: 81 },
      ],
    },
    routine: {
      name: 'Hipertrofia · 4 días',
      assignedSince: '1 de septiembre de 2026',
      version: 2,
    },
  },
  {
    id: 'andrea-quispe',
    fullName: 'Andrea Quispe',
    email: 'andrea.quispe@correo.com',
    status: 'INVITATION_EXPIRED',
    currentRoutine: null,
    lastWorkout: null,
    activeSince: '',
    bodyProfile: {
      goal: 'Acondicionamiento',
      weight: 62,
      height: 163,
      restrictions: '',
      updatedAt: '',
      weightHistory: [],
    },
    routine: null,
  },
  {
    id: 'renzo-castillo',
    fullName: 'Renzo Castillo',
    email: 'renzo.castillo@correo.com',
    status: 'INACTIVE',
    currentRoutine: null,
    lastWorkout: '12 ago, 18:30',
    activeSince: '3 de agosto de 2026',
    bodyProfile: {
      goal: 'Fuerza',
      weight: 84,
      height: 181,
      restrictions: '',
      updatedAt: '12 ago',
      weightHistory: [{ date: '12 ago 2026', weight: 84 }],
    },
    routine: null,
  },
]

export const CLIENTS_MOCK_CODES = {
  registration: 'FA-7K2Q',
  regeneration: 'FA-Q9M3',
} as const

export const CLIENTS_MOCK_EXPIRATION = '20 de septiembre de 2026, 10:30'
export const CLIENTS_MOCK_LATENCY_MS = 120
