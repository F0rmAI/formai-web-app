import type {
  AssignRoutineInput,
  DuplicateRoutineInput,
  Routine,
  RoutineAssignment,
  RoutineStatusFilter,
  RoutineVersion,
  SaveRoutineInput,
} from '@/types/routine'

export type RoutinesServiceErrorCode =
  | 'ROUTINE_NOT_FOUND'
  | 'VALIDATION'
  | 'EXERCISE_NOT_FOUND'
  | 'EXERCISE_ARCHIVED'
  | 'CLIENT_NOT_FOUND'
  | 'CLIENT_NOT_ASSIGNABLE'
  | 'UNEXPECTED'

export class RoutinesServiceError extends Error {
  readonly code: RoutinesServiceErrorCode

  constructor(code: RoutinesServiceErrorCode, message: string) {
    super(message)
    this.name = 'RoutinesServiceError'
    this.code = code
  }
}

export interface ListRoutinesParams {
  page?: number
  size?: number
}

export interface RoutinesService {
  list(params?: ListRoutinesParams): Promise<Routine[]>
  getById(routineId: string): Promise<Routine>
  create(input: SaveRoutineInput): Promise<Routine>
  update(routineId: string, input: SaveRoutineInput): Promise<Routine>
  getVersions(routineId: string): Promise<RoutineVersion[]>
  duplicate(routineId: string, input: DuplicateRoutineInput): Promise<Routine>
  assign(routineId: string, input: AssignRoutineInput): Promise<RoutineAssignment[]>
}

export function filterRoutinesByStatus(routines: Routine[], status: RoutineStatusFilter): Routine[] {
  if (status === 'ALL') return routines
  return routines.filter((routine) => routine.status === status)
}
