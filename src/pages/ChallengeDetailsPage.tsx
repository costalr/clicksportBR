import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChallengeBySlug } from '../features/challenges/services/challengeService'
import {
  getChallengeOffers,
  type ChallengeOffer,
} from '../features/challenges/services/challengeOfferService'
import type { Challenge } from '../features/challenges/types'
import './challenge-details.css'
import { ChallengeDetailsView } from '../features/challenges/components/ChallengeDetailsView'

export function ChallengeDetailsPage() {
  const { slug } = useParams()
  const [result, setResult] = useState<{
  slug: string | undefined
  challenge: Challenge | null
  offers: ChallengeOffer[]
  error: string
} | null>(null)

 useEffect(() => {
  let active = true

  async function load() {
    try {
      const challenge = await getChallengeBySlug(slug)

      const offers = challenge
        ? await getChallengeOffers(challenge.id)
        : []

      if (active) {
        setResult({
          slug,
          challenge,
          offers,
          error: '',
        })
      }
    } catch (loadError) {
      if (active) {
        setResult({
          slug,
          challenge: null,
          offers: [],
          error: loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar este desafio.',
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
  const loading = currentResult === null
  const challenge = currentResult?.challenge ?? null
  const error = currentResult?.error ?? ''
  const offers = currentResult?.offers ?? []

  if (loading) {
    return <main className="page-section"><p role="status">Carregando desafio...</p></main>
  }

  if (error) {
    return (
      <main className="page-section empty-state">
        <h1>Não foi possível carregar o desafio</h1>
        <p role="alert">{error}</p>
        <Link to="/desafios" className="button-primary">Voltar ao catálogo</Link>
      </main>
    )
  }

  if (!challenge) {
    return (
      <main className="page-section empty-state">
        <h1>Desafio não encontrado</h1>
        <p>Verifique o endereço ou consulte o catálogo.</p>
        <Link to="/desafios" className="button-primary">
          Explorar desafios
        </Link>
      </main>
    )
  }

    return (
    <ChallengeDetailsView
      challenge={challenge}
      offers={offers}
    />
  )
}