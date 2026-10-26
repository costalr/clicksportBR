import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Challenge } from './types'
import './challenge-preview.css'

type Props = {
  challenge: Challenge
  onClose: () => void
}

export function ChallengePreviewModal({ challenge, onClose }: Props) {
  const [expanded, setExpanded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]'
        )
      )

      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      className="challenge-preview-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Pré-visualização de ${challenge.name}`}
        className={`challenge-preview-modal ${expanded ? 'expanded' : ''}`}
      >
        <div className="preview-toolbar">
          <span>CLICKSPORTBR / PRÉ-VISUALIZAÇÃO</span>

          <div className="preview-toolbar-buttons">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? 'Reduzir visualização' : 'Expandir visualização'}
              title={expanded ? 'Reduzir' : 'Expandir'}
            >
              {expanded ? '↙' : '⤢'}
            </button>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar pré-visualização"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="preview-body">
         <div className="preview-art" aria-label="Representação ilustrativa de uma medalha">
  <span className="preview-art-heading">
    CLICKSPORTBR / SUA CONQUISTA
  </span>

  <div className="preview-medal-scene" aria-hidden="true">
    <div className="preview-medal-ribbon" />

    <div className="preview-medal">
      <div className="preview-medal-inner">
        <span>CLICKSPORTBR</span>
        <strong>{challenge.distanceKm}</strong>
        <small>KM</small>
      </div>
    </div>
  </div>

  <span className="preview-art-caption">
    IMAGEM ILUSTRATIVA · PRODUTO A CONFIRMAR
  </span>
</div>

          <div className="preview-content">
            <span className="preview-eyebrow">
              {challenge.modality} / DESAFIO VIRTUAL
            </span>

            <h2>{challenge.name}</h2>
            <p>{challenge.description}</p>

            <div className="preview-metrics">
              <div>
                <span>DISTÂNCIA</span>
                <strong>{challenge.distanceKm} km</strong>
              </div>
              <div>
                <span>DURAÇÃO</span>
                <strong>{challenge.durationDays} dias</strong>
              </div>
            </div>

            <div className="preview-status">
  <span className="preview-demo-badge">
    Desafio publicado
  </span>
  <small>
    Informações de produtos, kits e valores ainda não disponíveis.
  </small>
</div>

            {expanded && (
              <div className="preview-extra">
                <h3>Sobre o desafio</h3>
                <p>{challenge.description}</p>
                <p>
                  As inscrições comerciais ainda não estão disponíveis
                  nesta plataforma.
                </p>
              </div>
            )}

            <section className="preview-commercial-pending" aria-label="Informações comerciais">
            <div className="preview-commercial-heading">
              <span>OPÇÕES DE PARTICIPAÇÃO</span>
              <strong>Valores em definição</strong>
            </div>
            <p>
              As opções de participação, medalhas, kits e respectivos valores
              serão divulgados após a confirmação dos produtos.
            </p>
            <span className="preview-commercial-note">
              Informações comerciais ainda não disponíveis.
            </span>
          </section>

          <div className="preview-actions">
              <Link
                to={`/desafios/${challenge.slug}`}
                className="button-primary"
                onClick={onClose}
              >
                Ver página completa ↗
              </Link>

              <button
                type="button"
                className="preview-text-button"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? 'Ver menos' : 'Expandir detalhes'} ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
