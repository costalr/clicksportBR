
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getProductImageUrl,
  listAdminChallenges,
  listOffers,
  listProducts,
} from '../features/admin/adminCatalogService'

import { ChallengeDetailsView } from '../features/challenges/components/ChallengeDetailsView'
import './admin-challenge-preview.css'
import type { Challenge } from '../features/challenges/types'
import type { ChallengeOffer } from '../features/challenges/services/challengeOfferService'

type PreviewData = {
  challenge: Challenge
  offers: ChallengeOffer[]
}

export function AdminChallengePreviewPage() {
  const { slug } = useParams()

  const [result, setResult] = useState<{
    slug: string | undefined
    data: PreviewData | null
    error: string
  } | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [challenges, allOffers, products] = await Promise.all([
          listAdminChallenges(),
          listOffers(),
          listProducts(),
        ])

        const item = challenges.find(
          (challenge) => challenge.slug === slug
        )

        if (!item) {
          if (active) {
            setResult({
              slug,
              data: null,
              error: '',
            })
          }
          return
        }

        const challenge: Challenge = {
          id: item.id,
          slug: item.slug,
          name: item.titulo,
          description: item.descricao ?? '',
          modality: item.modalidade,
          distanceKm: item.distancia_km,
          durationDays: item.duracao_dias,
          status: item.status,
        }

        const offers: ChallengeOffer[] = allOffers
          .filter((offer) => offer.desafio_id === item.id)
          .map((offer) => ({
            id: offer.id,
            name: offer.nome,
            description: offer.descricao ?? '',
            price: offer.preco ?? 0,
            participationType: offer.tipo_participacao,
            products: offer.itens.flatMap((offerItem) => {
              const product = products.find(
                (product) => product.id === offerItem.produto_id
              )

              if (!product) return []

              return [{
                id: product.id,
                name: product.nome,
                description: product.descricao ?? '',
                imageUrl: product.imagem_caminho
                  ? getProductImageUrl(product.imagem_caminho)
                  : null,
                quantity: offerItem.quantidade,
              }]
            }),
          }))

        if (active) {
          setResult({
            slug,
            data: { challenge, offers },
            error: '',
          })
        }
      } catch (error) {
        if (active) {
          setResult({
            slug,
            data: null,
            error: error instanceof Error
              ? error.message
              : 'Não foi possível carregar a pré-visualização.',
          })
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [slug])

  const currentResult = result?.slug === slug ? result : null

  if (!currentResult) {
    return (
      <main className="page-section">
        <p role="status">Carregando pré-visualização...</p>
      </main>
    )
  }

  if (currentResult.error) {
    return (
      <main className="page-section empty-state">
        <h1>Erro ao carregar a pré-visualização</h1>
        <p role="alert">{currentResult.error}</p>
        <Link to="/admin?secao=challenges">
          Voltar à administração
        </Link>
      </main>
    )
  }

  if (!currentResult.data) {
    return (
      <main className="page-section empty-state">
        <h1>Desafio não encontrado</h1>
        <Link to="/admin?secao=challenges">
          Voltar à administração
        </Link>
      </main>
    )
  }

 
  const { challenge, offers } = currentResult.data

  const statusLabel = {
    rascunho: 'Rascunho',
    publicado: 'Publicado',
    encerrado: 'Encerrado',
  }[challenge.status]

  return (
    <>
      <header className="admin-preview-toolbar">
        <div className="admin-preview-toolbar-top">
          <div className="admin-preview-icon" aria-hidden="true">
            ◉
          </div>

          <div className="admin-preview-heading">
            <span className="admin-preview-eyebrow">
              MODO DE PRÉ-VISUALIZAÇÃO
            </span>

            <h2>{challenge.name}</h2>
          </div>

          <span
            className="admin-preview-status"
            data-status={challenge.status}
          >
            {statusLabel}
          </span>
        </div>

        <div className="admin-preview-toolbar-bottom">
          <p className="admin-preview-note">
            Visualização administrativa · Inscrições desabilitadas
          </p>

          <Link
            to="/admin?secao=challenges"
            className="admin-preview-back"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </header>

      <ChallengeDetailsView
        challenge={challenge}
        offers={offers}
        isPreview
      />
    </>
  )
}

