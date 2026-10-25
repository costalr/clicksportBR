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

  {
    id: 'demo-corrida-primeiros-passos',
    slug: 'corrida-primeiros-passos',
    name: 'Primeiros Passos',
    modality: 'Corrida',
    distanceKm: 5,
    durationDays: 15,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },

  {
    id: 'demo-corrida-ritmo-constante',
    slug: 'corrida-ritmo-constante',
    name: 'Ritmo Constante',
    modality: 'Corrida',
    distanceKm: 10,
    durationDays: 20,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },

  {
    id: 'demo-corrida-novos-limites',
    slug: 'corrida-novos-limites',
    name: 'Novos Limites',
    modality: 'Corrida',
    distanceKm: 21,
    durationDays: 30,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },

  {
    id: 'demo-corrida-meia-maratona',
    slug: 'corrida-meia-maratona',
    name: 'Rumo aos 21K',
    modality: 'Corrida',
    distanceKm: 21,
    durationDays: 45,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },

  {
    id: 'demo-corrida-ultra-superacao',
    slug: 'corrida-ultra-superacao',
    name: 'Ultra Superação',
    modality: 'Corrida',
    distanceKm: 150,
    durationDays: 90,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },

  {
    id: 'demo-corrida-desafio-200',
    slug: 'corrida-desafio-200',
    name: 'Desafio 200K',
    modality: 'Corrida',
    distanceKm: 200,
    durationDays: 90,
    description: 'Um desafio demonstrativo de corrida para explorar novas metas, acompanhar sua evolução e conhecer a experiência ClicksportBR.',
    status: 'soon',
  },
]
