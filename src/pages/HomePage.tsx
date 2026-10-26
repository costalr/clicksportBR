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
  const [featured, setFeatured] = useState<Awaited<ReturnType<typeof listChallenges>>>([])
  const [challengesLoading, setChallengesLoading] = useState(true)
  const [challengesError, setChallengesError] = useState('')

  useEffect(() => {
    let active = true
    void listChallenges()
      .then((items) => {
        if (active) setFeatured(items.filter((challenge) => challenge.modality === 'Corrida').slice(0, 3))
      })
      .catch((loadError: unknown) => {
        if (active) setChallengesError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os desafios.')
      })
      .finally(() => {
        if (active) setChallengesLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <main className="glass-home">
      <section className="glass-hero">
        <div className="glass-ambient glass-ambient-one" aria-hidden="true" />
        <div className="glass-ambient glass-ambient-two" aria-hidden="true" />

        <div className="glass-hero-inner">
          <div className="glass-hero-copy">
            <span className="glass-kicker">
              <span className="glass-kicker-dot" />
              CLICKSPORTBR / DESAFIOS VIRTUAIS DE CORRIDA
            </span>

            <h1>
              Sua próxima
              <span> conquista </span>
              tem história.
            </h1>

            <p>
              Encontre um desafio de corrida, avance no seu ritmo e celebre
              cada meta. Inspire-se nos conceitos visuais de medalhas e kits
              criados para celebrar cada conquista.
            </p>

            <div className="glass-hero-actions">
              <Link to="/desafios" className="glass-primary">
                Encontrar meu desafio <span aria-hidden="true">↗</span>
              </Link>
              <a href="#medalhas-kits" className="glass-outline">
                Ver medalhas e kits <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="glass-hero-footer">
              <span className="glass-footer-line" />
              <span>SEU RITMO. SUA META. UMA CONQUISTA PARA CELEBRAR.</span>
            </div>
          </div>

          <div className="glass-hero-stage" aria-hidden="true">
            <div className="glass-orbit glass-orbit-one" />
            <div className="glass-orbit glass-orbit-two" />
            <div className="glass-orbit glass-orbit-three" />

            <div className="glass-stage-number">RUN</div>

            <div className="glass-float-card glass-float-top">
              <span className="glass-float-label">CADA META CONTA</span>
              <strong>VÁ ALÉM.</strong>
              <span className="glass-float-sub">DESAFIOS VIRTUAIS</span>
            </div>

            <div className="glass-float-card glass-float-bottom">
              <span className="glass-pulse" />
              <div>
                <span className="glass-float-label">UMA CONQUISTA DE CADA VEZ</span>
                <strong>SEU PRÓXIMO DESAFIO</strong>
              </div>
              <span className="glass-float-arrow">↗</span>
            </div>

            <span className="glass-stage-caption">
              RUN / ACHIEVE / CLICKSPORTBR
            </span>
          </div>
        </div>

        <div className="glass-hero-bottom" aria-hidden="true">
          <span>01 — ESCOLHA</span>
          <span>02 — CORRA</span>
          <span>03 — CELEBRE</span>
          <span className="glass-scroll-label">ROLE PARA EXPLORAR ↓</span>
        </div>
      </section>

      <RevealSection className="glass-awards" id="medalhas-kits">
        <div className="glass-section-top">
          <div>
            <span className="glass-section-label">01 / CELEBRE SUA CONQUISTA</span>
            <h2>
              Cada quilômetro merece
              <em> uma lembrança.</em>
            </h2>
            <p>
              Medalhas e kits inspiram a celebração de cada meta. As imagens
              abaixo são conceitos visuais ilustrativos, não fotos de produtos
              finais nem confirmação de disponibilidade.
            </p>
          </div>
        </div>

        <div className="glass-award-grid">
          <article className="glass-award-card">
            <div className="glass-award-art glass-medal-art" aria-hidden="true">
              <span className="glass-medal-ribbon" />
              <span className="glass-medal-shape">
                <span>CONQUISTA</span>
              </span>
              <span className="glass-art-index">01 / CONCEITO VISUAL</span>
            </div>
            <div className="glass-award-copy">
              <span className="glass-section-label">MEDALHAS</span>
              <h3>Uma lembrança da sua jornada.</h3>
              <p>Conceito ilustrativo; não representa um modelo final ou disponibilidade.</p>
            </div>
          </article>
          <article className="glass-award-card">
            <div className="glass-award-art glass-kit-art" aria-hidden="true">
              <span className="glass-kit-box">
                <span className="glass-kit-box-mark">C</span>
              </span>
              <span className="glass-kit-orbit glass-kit-orbit-one" />
              <span className="glass-kit-orbit glass-kit-orbit-two" />
              <span className="glass-art-index">02 / CONCEITO VISUAL</span>
            </div>
            <div className="glass-award-copy">
              <span className="glass-section-label">KITS DE PREMIAÇÃO</span>
              <h3>Uma experiência feita para celebrar.</h3>
              <p>Conceito ilustrativo; itens e disponibilidade não estão definidos aqui.</p>
            </div>
          </article>
        </div>
      </RevealSection>

      <RevealSection className="glass-featured">
        <div className="glass-section-top">
          <div>
            <span className="glass-section-label">02 / SUA PRÓXIMA META</span>
            <h2>
              Um desafio para
              <em> ir mais longe.</em>
            </h2>
            <p>
              Explore as opções de corrida e encontre uma meta que combine
              com o seu momento.
            </p>
          </div>

          <Link to="/desafios" className="glass-text-link">
            Ver catálogo completo <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {challengesError ? (
          <p className="glass-empty" role="alert">{challengesError}</p>
        ) : challengesLoading ? (
          <p className="glass-empty" role="status">Carregando desafios publicados...</p>
        ) : featured.length > 0 ? (
          <div className="glass-challenge-grid">
            {featured.map((challenge) => (
              <div className="glass-challenge-wrap" key={challenge.id}>
                <ChallengeCard challenge={challenge} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-empty">
            <h3>Nenhum desafio publicado no momento.</h3>
            <p>Consulte o catálogo para acompanhar quando novos desafios estiverem disponíveis.</p>
            <Link to="/desafios" className="glass-outline">
              Consultar catálogo ↗
            </Link>
          </div>
        )}
      </RevealSection>

      <RevealSection className="glass-how" id="como-funciona">
        <div className="glass-how-heading">
          <span className="glass-section-label">03 / COMO FUNCIONAM OS DESAFIOS</span>
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
          <span className="glass-section-label">04 / CORRA DO SEU JEITO</span>
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

      <RevealSection className="glass-photo" id="fotografia">
        <div className="glass-photo-panel">
          <div className="glass-photo-art" aria-hidden="true">
            <span className="glass-photo-lens" />
            <span className="glass-photo-word">FOCO.</span>
          </div>
          <div className="glass-photo-copy">
            <span className="glass-section-label">FOTOGRAFIA ESPORTIVA</span>
            <h3>O esporte também vive nos instantes.</h3>
            <p>
              A fotografia esportiva segue como parte da ClicksportBR.
              Estamos preparando um espaço para apresentar coberturas e
              histórias registradas em eventos.
            </p>
            <span className="glass-coming">Galeria de fotografias em preparação</span>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="glass-final">
        <div className="glass-final-glow" aria-hidden="true" />
        <span className="glass-section-label">SUA PRÓXIMA CONQUISTA</span>
        <h2>
          Seu próximo passo
          <br />
          <em>começa com uma meta.</em>
        </h2>
        <p>Explore o catálogo de desafios virtuais de corrida.</p>
        <Link to="/desafios" className="glass-primary">
          Ver desafios disponíveis ↗
        </Link>
      </RevealSection>
    </main>
  )
}
