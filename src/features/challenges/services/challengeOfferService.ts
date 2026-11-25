
import { supabase } from '../../../lib/supabase'

export type ChallengeOfferProduct = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  quantity: number
}

export type ChallengeOffer = {
  id: string
  name: string
  description: string | null
  price: number
  participationType: 'digital' | 'fisica' | 'mista'
  products: ChallengeOfferProduct[]
}

type ProductRow = {
  id: string
  nome: string
  descricao: string | null
  imagem_caminho: string | null
  ativo: boolean
}

type OfferItemRow = {
  quantidade: number
  produtos: ProductRow | null
}

type OfferRow = {
  id: string
  nome: string
  descricao: string | null
  preco: number | null
  tipo_participacao: string
  oferta_itens: OfferItemRow[] | null
}

export async function getChallengeOffers(
  challengeId: string,
): Promise<ChallengeOffer[]> {
  const { data, error } = await supabase
    .from('ofertas_desafio')
    .select(`
      id,
      nome,
      descricao,
      preco,
      tipo_participacao,
      oferta_itens (
        quantidade,
        produtos (
          id,
          nome,
          descricao,
          imagem_caminho,
          ativo
        )
      )
    `)
    .eq('desafio_id', challengeId)
    .eq('status', 'publicada')
    .order('ordem_exibicao', { ascending: true })

  if (error) throw error

  return ((data ?? []) as unknown as OfferRow[])
    .filter(
      (offer) =>
        offer.preco !== null &&
        ['digital', 'fisica', 'mista'].includes(offer.tipo_participacao),
    )
    .map((offer) => ({
      id: offer.id,
      name: offer.nome,
      description: offer.descricao,
      price: offer.preco as number,
      participationType: offer.tipo_participacao as
        'digital' | 'fisica' | 'mista',
      products: (offer.oferta_itens ?? [])
        .filter((item) => item.produtos?.ativo === true)
        .map((item) => {
          const product = item.produtos!

          const imageUrl = product.imagem_caminho
            ? supabase.storage
                .from('produtos')
                .getPublicUrl(product.imagem_caminho).data.publicUrl
            : null

          return {
            id: product.id,
            name: product.nome,
            description: product.descricao,
            imageUrl,
            quantity: item.quantidade,
          }
        }),
    }))
}
