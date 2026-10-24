import type { Challenge } from './types'

/*
 * Dados exclusivamente demonstrativos.
 * Serão substituídos por dados do Supabase.
 */
export const mockChallenges: Challenge[] = [
  {
    id: '1',
    slug: 'desafio-superacao',
    name: 'Desafio Superação',
    modality: 'Corrida',
    distanceKm: 50,
    durationDays: 30,
    description:
      'Um desafio virtual para quem deseja estabelecer metas e evoluir na corrida.',
    status: 'open',
  },
  {
    id: '2',
    slug: 'desafio-movimento',
    name: 'Desafio Movimento',
    modality: 'Caminhada',
    distanceKm: 30,
    durationDays: 30,
    description:
      'Uma proposta para incorporar mais movimento à rotina.',
    status: 'soon',
  },
  {
    id: '3',
    slug: 'desafio-resistencia',
    name: 'Desafio Resistência',
    modality: 'Corrida',
    distanceKm: 100,
    durationDays: 60,
    description:
      'Um desafio para corredores que desejam trabalhar a consistência.',
    status: 'open',
  },
]
