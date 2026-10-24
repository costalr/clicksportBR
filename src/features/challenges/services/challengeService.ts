import { mockChallenges } from '../mockChallenges'
import type { Challenge } from '../types'

/**
 * Fonte temporária de dados.
 *
 * Quando integrarmos o Supabase, esta camada será
 * adaptada para consultas assíncronas.
 */
export function listChallenges(): Challenge[] {
  return mockChallenges
}

export function getChallengeBySlug(
  slug: string | undefined
): Challenge | undefined {
  return mockChallenges.find(
    (challenge) => challenge.slug === slug
  )
}
