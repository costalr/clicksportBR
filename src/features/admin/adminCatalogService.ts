import { supabase } from '../../lib/supabase'

export type AdminChallengeStatus = 'rascunho' | 'publicado' | 'encerrado'

export type AdminChallenge = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  modalidade: 'corrida'
  distancia_km: number
  duracao_dias: number
  status: AdminChallengeStatus
}

export type ChallengeInput = Omit<AdminChallenge, 'id'> & { id?: string }

export type Product = {
  id: string
  nome: string
  descricao: string | null
  tipo: 'fisico' | 'digital'
  imagem_caminho: string | null
  ativo: boolean
}

export type ProductInput = Omit<Product, 'id'> & { id?: string }

export type OfferStatus = 'rascunho' | 'publicada' | 'suspensa' | 'encerrada'
export type ParticipationType = 'a_definir' | 'digital' | 'fisica' | 'mista'

export type OfferItem = {
  produto_id: string
  quantidade: number
}

export type Offer = {
  id: string
  desafio_id: string
  nome: string
  descricao: string | null
  preco: number | null
  tipo_participacao: ParticipationType
  status: OfferStatus
  ordem_exibicao: number
  itens: OfferItem[]
}

export type OfferInput = Omit<Offer, 'id' | 'itens'> & {
  id?: string
  itens: OfferItem[]
}

export class OfferCompositionError extends Error {
  readonly offerId: string

  constructor(offerId: string, message: string) {
    super(message)
    this.offerId = offerId
    this.name = 'OfferCompositionError'
  }
}

export async function listAdminChallenges(): Promise<AdminChallenge[]> {
  const { data, error } = await supabase
    .from('desafios')
    .select('id, slug, titulo, descricao, modalidade, distancia_km, duracao_dias, status')
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdminChallenge[]
}

export async function saveChallenge(input: ChallengeInput): Promise<void> {
  const { id, ...values } = input
  const result = id
    ? await supabase.from('desafios').update(values).eq('id', id).select('id').single()
    : await supabase.from('desafios').insert(values).select('id').single()
  if (result.error) throw result.error
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('id, nome, descricao, tipo, imagem_caminho, ativo')
    .order('nome')
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function saveProduct(input: ProductInput): Promise<void> {
  const { id, ...values } = input
  const result = id
    ? await supabase.from('produtos').update(values).eq('id', id).select('id').single()
    : await supabase.from('produtos').insert(values).select('id').single()
  if (result.error) throw result.error
}

const PRODUCT_IMAGE_BUCKET = 'produtos'

export function getProductImageUrl(path: string | null): string | null {
  if (!path) return null

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadProductImage(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Selecione uma imagem JPG, PNG ou WebP.')
  }

  if (file.size > maxSize) {
    throw new Error('A imagem deve ter no máximo 5 MB.')
  }

  const extension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }[file.type]

  const path = `medalhas/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error

  return path
}

export async function removeProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path])

  if (error) throw error
}

export async function listOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('ofertas_desafio')
    .select('id, desafio_id, nome, descricao, preco, tipo_participacao, status, ordem_exibicao, oferta_itens(produto_id, quantidade)')
    .order('ordem_exibicao')
  if (error) throw error
  return (data ?? []).map((row) => {
    const offer = row as Omit<Offer, 'itens'> & {
      oferta_itens: OfferItem[] | null
    }
    return { ...offer, itens: offer.oferta_itens ?? [] }
  })
}

export async function saveOffer(input: OfferInput): Promise<void> {
  const { id, itens, ...values } = input
  const result = id
    ? await supabase.from('ofertas_desafio').update(values).eq('id', id).select('id').single()
    : await supabase.from('ofertas_desafio').insert(values).select('id').single()

  if (result.error) throw result.error

  const offerId = id ?? result.data.id
  const { error: deleteError } = await supabase
    .from('oferta_itens')
    .delete()
    .eq('oferta_id', offerId)
  if (deleteError) {
    throw new OfferCompositionError(
      offerId,
      `Oferta salva, mas não foi possível atualizar sua composição: ${deleteError.message}`,
    )
  }

  if (itens.length) {
    const { error: insertError } = await supabase
      .from('oferta_itens')
      .insert(itens.map((item) => ({ ...item, oferta_id: offerId })))
    if (insertError) {
      throw new OfferCompositionError(
        offerId,
        `Oferta salva, mas não foi possível gravar sua composição: ${insertError.message}`,
      )
    }
  }
}
