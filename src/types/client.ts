/**
 * Domain types of the clients a trainer manages.
 *
 * @author Melina
 * @packageDocumentation
 */

import type { TrainingDay } from '@/types/routine'

/**
 * Lifecycle states of a client.
 *
 * @remarks
 * - `ACTIVE`: activated the account and can train.
 * - `INVITED`: registered, with an activation code still valid.
 * - `INVITATION_EXPIRED`: registered, but the activation code expired.
 * - `INACTIVE`: deactivated by the trainer; the history is kept.
 */
export type ClientStatus = 'ACTIVE' | 'INVITED' | 'INVITATION_EXPIRED' | 'INACTIVE'

/**
 * Values of the status filter of the clients list; `ALL` disables the filter.
 */
export type ClientStatusFilter = 'ALL' | ClientStatus

/**
 * Describes a client as shown in lists.
 */
export interface ClientSummary {
  /** Unique identifier assigned by the server. */
  id: string
  /** Full name of the client. */
  fullName: string
  /** Email used to sign in to the mobile app, or `null` before activation. */
  email: string | null
  /** Lifecycle state. */
  status: ClientStatus
  /** Name of the routine the client follows today, or `null` when there is none. */
  currentRoutine: string | null
  /** Date of the last workout, already formatted, or `null` when there is none. */
  lastWorkout: string | null
}

/**
 * Describes one body weight measurement.
 */
export interface WeightEntry {
  /** Date of the measurement, already formatted. */
  date: string
  /** Body weight in kilograms. */
  weight: number
}

/**
 * Describes the physical profile of a client.
 */
export interface BodyProfile {
  /** Training goal, such as `Hipertrofia`. */
  goal: string
  /** Current body weight in kilograms; `0` when it was never recorded. */
  weight: number
  /** Height in centimeters; `0` when it was never recorded. */
  height: number
  /** Injuries or restrictions; empty when there are none. */
  restrictions: string
  /** Date of the last weight measurement, already formatted; empty when there is none. */
  updatedAt: string
  /** Weight measurements, newest first. */
  weightHistory: WeightEntry[]
}

/**
 * Describes the routine a client follows today.
 */
export interface CurrentRoutine {
  /** Identifier of the routine. */
  id: string
  /** Name of the routine. */
  name: string
  /** Start date of the assignment, already formatted. */
  assignedSince: string
  /** Current version of the routine, or `null` when it could not be read. */
  version: number | null
  /** Training days of the current assignment, in Monday to Sunday order. */
  trainingDays: TrainingDay[]
}

/** One assignment in the history of a client. */
export interface ClientAssignment {
  /** Assigned routine identifier. */
  routineId: string
  /** Routine name, with a fallback for a previous trainer's routine. */
  routineName: string
  /** Formatted first day of the assignment. */
  startDate: string
  /** Formatted last day, or `null` while the assignment is open. */
  endDate: string | null
  /** Training days in Monday to Sunday order. */
  trainingDays: TrainingDay[]
  /** Whether this is the current assignment. */
  current: boolean
}

/**
 * Describes a client with the data of its detail page.
 */
export interface ClientDetail extends ClientSummary {
  /** Registration date, already formatted. */
  activeSince: string
  /** Physical profile. */
  bodyProfile: BodyProfile
  /** Routine followed today, or `null` when there is none. */
  routine: CurrentRoutine | null
  /** All assignments, newest first. */
  assignments: ClientAssignment[]
}

/**
 * Data needed to register a client.
 */
export interface RegisterClientInput {
  /** Full name of the client. */
  fullName: string
}

/**
 * Data sent to update the physical profile of a client.
 */
export interface UpdateBodyProfileInput {
  /** Training goal. */
  goal: string
  /** Body weight in kilograms, greater than `0`. */
  weight: number
  /** Height in centimeters, between `100` and `250`. */
  height: number
  /** Injuries or restrictions; empty when there are none. */
  restrictions: string
}

/**
 * Describes the code a client uses to activate the account in the mobile app.
 */
export interface ActivationCode {
  /** Identifier of the client the code belongs to. */
  clientId: string
  /** Full name of the client. */
  clientName: string
  /** Code to share with the client. */
  code: string
  /** Expiration date and time, already formatted. */
  expiresAt: string
}
