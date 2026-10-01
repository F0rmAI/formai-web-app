/**
 * Paths of the app, defined once so pages and guards never write them by hand.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Paths of the app; the functions build the path of one resource.
 */
export const ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  forgotPasswordSent: '/forgot-password/sent',
  passwordReset: '/password-reset',
  clientGate: '/access-app',
  clients: '/clients',
  client: (clientId: string) => `/clients/${clientId}`,
  clientWorkouts: (clientId: string) => `/clients/${clientId}/workouts`,
  clientWorkout: (clientId: string, sessionId: string) => `/clients/${clientId}/workouts/${sessionId}`,
  clientProgress: (clientId: string) => `/clients/${clientId}/progress`,
  exercises: '/exercises',
  routines: '/routines',
  routineNew: '/routines/new',
  routine: (routineId: string) => `/routines/${routineId}`,
  routineEdit: (routineId: string) => `/routines/${routineId}/edit`,
  routineVersions: (routineId: string) => `/routines/${routineId}/versions`,
} as const
