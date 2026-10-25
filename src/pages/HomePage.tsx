import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChallengeCard } from '../features/challenges/ChallengeCard'
import { listChallenges } from '../features/challenges/services/challengeService'
import './home.css'

const steps = [
  {
    number: '01',
    title: 'Escolha sua meta',
    description: 'Encontre um desafio de corrida que combine com seu momento.',
  },
  {
    number: '02',
    title: 'Prepare-se',
    description: 'Conheça as condições do desafio e organize sua corrida.',
  },
  {
    number: '03',
    title: 'Corra e registre',
    description: 'Realize sua atividade e reúna o comprovante da distância.',
  },
  {
    number: '04',
    title: 'Acompanhe',
    description: 'Envie o comprovante e acompanhe sua avaliação na plataforma.',
  },
]

function useReveal() {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (!('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px 60px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function RevealSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const { ref, visible } = useReveal()

  return (
    <section
      ref={ref}
      id={id}
      className={`glass-reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </section>
  )
}

export function HomePage() {
  const featured = listChallenges()
    .filter((challenge) => challenge.modality === 'Corrida')
    .slice(0, 6)

  return (
    <main className="glass-home">
      <section className="glass-hero">
        <div className="glass-ambient glass-ambient-one" aria-hidden="true" />
        <div className="glass-ambient glass-ambient-two" aria-hidden="true" />

        <div className="glass-hero-inner">
          <div className="glass-hero-copy">
            <span className="glass-kicker">
              <span className="glass-kicker-dot" />
              CLICKSPORTBR / DESAFIOS DE CORRIDA
            </span>

            <h1>
              A próxima
              <span> conquista </span>
              começa em você.
            </h1>

            <p>
              Transforme seus quilômetros em novas metas.
              Descubra desafios virtuais de corrida e acompanhe
              cada etapa da sua jornada.
            </p>

            <div className="glass-hero-actions">
              <Link to="/desafios" className="glass-primary">
                Explorar desafios <span aria-hidden="true">↗</span>
              </Link>
              <a href="#como-funciona" className="glass-outline">
                Como funciona <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="glass-hero-footer">
              <span className="glass-footer-line" />
              <span>SEU RITMO. SUA DISTÂNCIA. SUA HISTÓRIA.</span>
            </div>
          </div>

          <div className="glass-hero-stage" aria-hidden="true">
            <div className="glass-orbit glass-orbit-one" />
            <div className="glass-orbit glass-orbit-two" />
            <div className="glass-orbit glass-orbit-three" />

            <div className="glass-stage-number">RUN</div>

            <div className="glass-float-card glass-float-top">
              <span className="glass-float-label">SEU PRÓXIMO OBJETIVO</span>
              <strong>VÁ MAIS LONGE.</strong>
              <span className="glass-float-sub">UMA CONQUISTA DE CADA VEZ</span>
            </div>

            <div className="glass-float-card glass-float-bottom">
              <span className="glass-pulse" />
              <div>
                <span className="glass-float-label">MODO DESAFIO</span>
                <strong>ATIVADO</strong>
              </div>
              <span className="glass-float-arrow">↗</span>
            </div>

            <span className="glass-stage-caption">
              MOVE FORWARD / CLICKSPORTBR
            </span>
          </div>
        </div>

        <div className="glass-hero-bottom" aria-hidden="true">
          <span>01 — DESCUBRA</span>
          <span>02 — CORRA</span>
          <span>03 — CONQUISTE</span>
          <span className="glass-scroll-label">ROLE PARA EXPLORAR ↓</span>
        </div>
      </section>

      <RevealSection className="glass-featured">
        <div className="glass-section-top">
          <div>
            <span className="glass-section-label">01 / SUA PRÓXIMA META</span>
            <h2>
              Desafios que fazem
              <em> você avançar.</em>
            </h2>
            <p>
              Encontre sua próxima distância e conheça
              os desafios disponíveis.
            </p>
          </div>

          <Link to="/desafios" className="glass-text-link">
            Ver catálogo completo <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="glass-challenge-grid">
            {featured.map((challenge) => (
              <div className="glass-challenge-wrap" key={challenge.id}>
                <ChallengeCard challenge={challenge} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-empty">
            <h3>Novos desafios estão a caminho.</h3>
            <p>Consulte o catálogo para acompanhar as novidades.</p>
            <Link to="/desafios" className="glass-outline">
              Consultar catálogo ↗
            </Link>
          </div>
        )}
      </RevealSection>

      <RevealSection className="glass-how" id="como-funciona">
        <div className="glass-how-heading">
          <span className="glass-section-label">02 / COMO FUNCIONA</span>
          <h2>
            Uma jornada.
            <br />
            <em>Quatro passos.</em>
          </h2>
          <p>
            Do primeiro desafio ao acompanhamento da sua atividade:
            tudo em um só lugar.
          </p>
        </div>

        <div className="glass-timeline">
          {steps.map((step) => (
            <article className="glass-timeline-step" key={step.number}>
              <div className="glass-timeline-marker">
                <span>{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="glass-statement">
        <div className="glass-statement-glow" aria-hidden="true" />
        <div className="glass-statement-copy">
          <span className="glass-section-label">03 / CORRA DO SEU JEITO</span>
          <h2>
            NÃO É SOBRE
            <br />
            SER O MAIS RÁPIDO.
            <br />
            <span>É SOBRE IR ALÉM.</span>
          </h2>
          <p>
            Cada corredor tem seu próprio ponto de partida.
            Encontre uma meta que faça sentido para você.
          </p>
          <Link to="/desafios" className="glass-primary">
            Descobrir desafios ↗
          </Link>
        </div>
        <div className="glass-statement-graphic" aria-hidden="true">
          <span>GO</span>
          <span>BE</span>
          <span>YOND.</span>
        </div>
      </RevealSection>

      <RevealSection className="glass-final">
        <div className="glass-final-glow" aria-hidden="true" />
        <span className="glass-section-label">O PRÓXIMO PASSO É SEU</span>
        <h2>
          Sua próxima linha de
          <br />
          <em>chegada começa aqui.</em>
        </h2>
        <p>Explore os desafios de corrida e encontre sua próxima meta.</p>
        <Link to="/desafios" className="glass-primary">
          Ver desafios disponíveis ↗
        </Link>
      </RevealSection>
    </main>
  )
}
