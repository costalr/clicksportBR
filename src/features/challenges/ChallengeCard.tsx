import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Challenge } from './types'
import { statusLabels } from './types'
import { ChallengePreviewModal } from './ChallengePreviewModal'

type Props = {
  challenge: Challenge
}

export function ChallengeCard({ challenge }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const closePreview = useCallback(() => setPreviewOpen(false), [])

  return (
    <>
      <article className="challenge-card preview-card">
        <button
          type="button"
          className="preview-card-visual"
          onClick={() => setPreviewOpen(true)}
          aria-label={`Pré-visualizar ${challenge.name}`}
        >
          <span className="preview-card-orbit" aria-hidden="true" />
          <strong>{challenge.distanceKm}<small> KM</small></strong>
          <span className="preview-card-hint">VISUALIZAR ↗</span>
        </button>

        <div className="challenge-card-content">
          <span className="eyebrow">{challenge.modality}</span>
          <h3>{challenge.name}</h3>

          <p>
            {challenge.distanceKm} km · {challenge.durationDays} dias
          </p>

          <span className={`challenge-status status-${challenge.status}`}>
            {statusLabels[challenge.status]}
          </span>

          <div className="preview-card-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setPreviewOpen(true)}
            >
              Pré-visualizar
            </button>

            <Link
              to={`/desafios/${challenge.slug}`}
              className="preview-card-expand"
              aria-label={`Abrir página completa de ${challenge.name}`}
              title="Abrir página completa"
            >
              ⤢
            </Link>
          </div>
        </div>
      </article>

      {previewOpen && (
        <ChallengePreviewModal
          challenge={challenge}
          onClose={closePreview}
        />
      )}
    </>
  )
}
