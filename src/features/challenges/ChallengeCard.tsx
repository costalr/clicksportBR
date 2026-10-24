import { Link } from 'react-router-dom'
import type { Challenge } from './types'
import { statusLabels } from './types'

interface ChallengeCardProps {
  challenge: Challenge
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <article className="challenge-card">
      <div className="challenge-card-image" aria-hidden="true">
        <span>CLICKSPORTBR</span>
      </div>

      <div className="challenge-card-content">
        <span className="eyebrow">{challenge.modality}</span>

        <h3>{challenge.name}</h3>

        <p>
          {challenge.distanceKm} km · {challenge.durationDays} dias
        </p>

        <span className={`challenge-status status-${challenge.status}`}>
          {statusLabels[challenge.status]}
        </span>

        <Link
          className="button-secondary"
          to={`/desafios/${challenge.slug}`}
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
