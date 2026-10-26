import { supabase } from '../../../lib/supabase'
import type { Challenge } from '../types'

type PublicChallengeRow = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  modalidade: 'corrida'
  distancia_km: number
  duracao_dias: number
  status: 'publicado'
}

const publicChallengeFields = 'id, slug, titulo, descricao, modalidade, distancia_km, duracao_dias, status'

function toChallenge(row: PublicChallengeRow): Challenge {
  return {
    id: row.id,
    slug: row.slug,
    name: row.titulo,
    modality: 'Corrida',
    distanceKm: row.distancia_km,
    durationDays: row.duracao_dias,
    description: row.descricao ?? '',
    status: 'published',
  }
}

export async function listChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('desafios')
    .select(publicChallengeFields)
    .eq('status', 'publicado')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return ((data ?? []) as PublicChallengeRow[]).map(toChallenge)
}

export async function getChallengeBySlug(
  slug: string | undefined,
): Promise<Challenge | null> {
  if (!slug) return null
  const { data, error } = await supabase
    .from('desafios')
    .select(publicChallengeFields)
    .eq('slug', slug)
    .eq('status', 'publicado')
    .maybeSingle()
  if (error) throw error
  return data ? toChallenge(data as PublicChallengeRow) : null
}
