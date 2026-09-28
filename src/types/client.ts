export type ClientStatus = 'ACTIVE' | 'INVITED' | 'INVITATION_EXPIRED' | 'INACTIVE'

export type ClientStatusFilter = 'ALL' | ClientStatus

export interface ClientSummary {
  id: string
  fullName: string
  email: string
  status: ClientStatus
  currentRoutine: string | null
  lastWorkout: string | null
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface BodyProfile {
  goal: string
  weight: number
  height: number
  restrictions: string
  updatedAt: string
  weightHistory: WeightEntry[]
}

export interface CurrentRoutine {
  name: string
  assignedSince: string
  version: number
}

export interface ClientDetail extends ClientSummary {
  activeSince: string
  bodyProfile: BodyProfile
  routine: CurrentRoutine | null
}

export interface RegisterClientInput {
  fullName: string
  email: string
}

export interface UpdateBodyProfileInput {
  goal: string
  weight: number
  height: number
  restrictions: string
}

export interface ActivationCode {
  clientId: string
  clientName: string
  code: string
  expiresAt: string
}
