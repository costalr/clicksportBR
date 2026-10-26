import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChallengeBySlug } from '../features/challenges/services/challengeService'
import type { Challenge } from '../features/challenges/types'
import './challenge-details.css'

export function ChallengeDetailsPage() {
  const { slug } = useParams()
  const [result, setResult] = useState<{
    slug: string | undefined
    challenge: Challenge | null
    error: string
  } | null>(null)

  useEffect(() => {
    let active = true
    void getChallengeBySlug(slug)
      .then((result) => {
        if (active) setResult({ slug, challenge: result, error: '' })
      })
      .catch((loadError: unknown) => {
        if (active) setResult({
          slug,
          challenge: null,
          error: loadError instanceof Error ? loadError.message : 'Não foi possível carregar este desafio.',
        })
      })
    return () => { active = false }
  }, [slug])

  const currentResult = result?.slug === slug ? result : null
  const loading = currentResult === null
  const challenge = currentResult?.challenge ?? null
  const error = currentResult?.error ?? ''

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
    <main className="cd-page">
      <div className="cd-container">
        <Link to="/desafios" className="cd-back">
          <span aria-hidden="true">←</span>
          Voltar aos desafios
        </Link>

        <section className="cd-hero" aria-labelledby="cd-title">
          <div className="cd-hero-content">
            <div className="cd-kicker">
              <span className="cd-kicker-dot" />
              CLICKSPORTBR / {challenge.modality.toUpperCase()}
            </div>

            <span className="cd-status">Desafio publicado · participação indisponível</span>

            <h1 id="cd-title">{challenge.name}</h1>

            <p className="cd-lead">
              Uma conquista construída quilômetro por quilômetro.
            </p>

            <p className="cd-description">
              {challenge.description}
            </p>

            <div className="cd-hero-actions">
              <a href="#sobre" className="cd-primary-link">
                Conhecer o desafio
                <span aria-hidden="true">↗</span>
              </a>

              <Link to="/desafios" className="cd-secondary-link">
                Explorar outros desafios
              </Link>
            </div>
          </div>

          <div className="cd-visual" aria-hidden="true">
            <div className="cd-visual-ring cd-ring-one" />
            <div className="cd-visual-ring cd-ring-two" />
            <div className="cd-visual-ring cd-ring-three" />
            <div className="cd-visual-center">
              <span className="cd-visual-label">SUA META</span>
              <strong>{challenge.distanceKm}</strong>
              <span className="cd-visual-unit">QUILÔMETROS</span>
            </div>
          </div>
        </section>

        <section className="cd-metrics" aria-label="Informações do desafio">
          <div className="cd-metric">
            <span>META TOTAL</span>
            <strong>{challenge.distanceKm} <small>km</small></strong>
            <p>Distância do desafio</p>
          </div>

          <div className="cd-metric">
            <span>DURAÇÃO</span>
            <strong>{challenge.durationDays} <small>dias</small></strong>
            <p>Período previsto</p>
          </div>

          <div className="cd-metric">
            <span>MODALIDADE</span>
            <strong className="cd-metric-text">{challenge.modality}</strong>
            <p>Categoria esportiva</p>
          </div>
        </section>

        <section className="cd-offers" aria-labelledby="cd-offers-title">
          <div className="cd-offers-heading">
            <div>
              <span className="cd-section-label">EXPERIÊNCIA CLICKSPORTBR</span>
              <h2 id="cd-offers-title">Informações de participação.</h2>
              <p>
                Conheça a proposta do desafio. Informações comerciais e
                fotografias oficiais de medalhas e kits serão divulgadas
                quando estiverem definidas.
              </p>
            </div>
            <span className="cd-offers-state">Valores em definição</span>
          </div>
          <div className="cd-offers-grid">
            <div className="cd-offers-product" aria-label="Espaço reservado para os produtos">
              <div className="cd-offers-product-icon" aria-hidden="true">✦</div>
              <strong>Produtos e kits</strong>
              <p>Nenhum produto ou imagem oficial foi associado a este desafio.</p>
              <span>INFORMAÇÕES NÃO DISPONÍVEIS</span>
            </div>
            <div className="cd-offers-options">
              <span className="cd-section-label">PARTICIPAÇÃO</span>
              <h3>Nenhuma oferta disponível.</h3>
              <p>
                Formatos, itens associados e condições comerciais ainda não
                estão disponíveis.
              </p>
              <div className="cd-offers-price">
                <span>VALOR</span>
                <strong>Em definição</strong>
              </div>
              <button type="button" disabled className="cd-disabled-action">
                Inscrições indisponíveis
              </button>
              <small>Nenhuma compra, pagamento ou inscrição comercial está ativa.</small>
            </div>
          </div>
        </section>

        <section id="sobre" className="cd-content">
          <div className="cd-about">
            <span className="cd-section-label">SOBRE O DESAFIO</span>
            <h2>Uma meta, no seu ritmo.</h2>
            <p>{challenge.description}</p>
          </div>
        </section>

        <section className="cd-outro">
          <span>GO BEYOND</span>
          <h2>Não é sobre ser o mais rápido. É sobre ir além.</h2>
          <Link to="/desafios">
            Descobrir outros desafios <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </main>
  )
}
