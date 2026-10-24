import type { Challenge, ChallengeModality } from './types'

export type ModalityFilter = 'Todas' | ChallengeModality

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

export function filterChallenges(
  challenges: Challenge[],
  search: string,
  modality: ModalityFilter
): Challenge[] {
  const term = normalizeText(search)

  return challenges.filter((challenge) => {
    const matchesName = normalizeText(challenge.name).includes(term)

    const matchesModality =
      modality === 'Todas' || challenge.modality === modality

    return matchesName && matchesModality
  })
}
