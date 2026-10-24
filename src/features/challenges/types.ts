export type ChallengeModality = 'Corrida' | 'Caminhada'

export type ChallengeStatus = 'open' | 'soon' | 'closed'

export interface Challenge {
  id: string
  slug: string
  name: string
  modality: ChallengeModality
  distanceKm: number
  durationDays: number
  description: string
  status: ChallengeStatus
}

export const statusLabels: Record<ChallengeStatus, string> = {
  open: 'Inscrições abertas',
  soon: 'Em breve',
  closed: 'Inscrições encerradas',
}
