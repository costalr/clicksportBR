import { Link, useParams } from 'react-router-dom'
import { mockChallenges } from '../features/challenges/mockChallenges'
import { statusLabels } from '../features/challenges/types'

export function ChallengeDetailsPage() {
  const { slug } = useParams()

  const challenge = mockChallenges.find(
    (item) => item.slug === slug
  )

  if (!challenge) {
    return (
      <main className="page-section empty-state">
        <h1>Desafio não encontrado</h1>
        <p>Verifique o endereço ou consulte o catálogo.</p>
        <Link to="/desafios" className="button-primary">
          Ver desafios
        </Link>
      </main>
    )
  }

  return (
    <main className="page-section details-page">
      <Link to="/desafios" className="text-link">
        ← Voltar aos desafios
      </Link>

      <span className="eyebrow">{challenge.modality}</span>
      <h1>{challenge.name}</h1>

      <p className="hero-description">{challenge.description}</p>

      <div className="details-grid">
        <div className="detail-box">
          <span>Meta</span>
          <strong>{challenge.distanceKm} km</strong>
        </div>

        <div className="detail-box">
          <span>Duração</span>
          <strong>{challenge.durationDays} dias</strong>
        </div>

        <div className="detail-box">
          <span>Situação</span>
          <strong>{statusLabels[challenge.status]}</strong>
        </div>
      </div>

      <div className="status-card">
        <h2>Inscrições ainda não disponíveis</h2>
        <p>
          Esta página utiliza dados demonstrativos.
          As inscrições serão habilitadas após a definição
          das regras comerciais e a integração de pagamentos.
        </p>
        <button type="button" disabled className="button-primary">
          Inscrição indisponível
        </button>
      </div>
    </main>
  )
}
