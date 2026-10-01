import type {
  ProgressChart,
  ProgressReport,
  ProgressWeeks,
  RecordSetInput,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/types/workout'

export type WorkoutsServiceErrorCode =
  | 'SESSION_NOT_FOUND'
  | 'CLIENT_NOT_FOUND'
  | 'INVALID_RANGE'
  | 'SESSION_CONFLICT'
  | 'INVALID_SET'

export class WorkoutsServiceError extends Error {
  readonly code: WorkoutsServiceErrorCode

  constructor(code: WorkoutsServiceErrorCode, message: string) {
    super(message)
    this.name = 'WorkoutsServiceError'
    this.code = code
  }
}

export interface WorkoutsService {
  list(clientId: string): Promise<WorkoutSessionSummary[]>
  getById(clientId: string, sessionId: string): Promise<WorkoutSession>
  recordSet(clientId: string, sessionId: string, input: RecordSetInput): Promise<WorkoutSession>
  correctSet(clientId: string, sessionId: string, input: RecordSetInput): Promise<WorkoutSession>
  finishSession(clientId: string, sessionId: string, confirmPartial: boolean): Promise<WorkoutSession>
  getProgressReport(clientId: string, from: string, to: string): Promise<ProgressReport>
  getProgressChart(clientId: string, exerciseId: string, weeks: ProgressWeeks): Promise<ProgressChart>
}
