import { Link } from 'react-router-dom'
import { ChallengeCard } from '../features/challenges/ChallengeCard'
import { mockChallenges } from '../features/challenges/mockChallenges'

export function HomePage() {
  const featured = mockChallenges.filter(
    (challenge) => challenge.status === 'open'
  )

  return (
    <>
      <section className="hero">
        <span className="eyebrow">DESAFIOS ESPORTIVOS VIRTUAIS</span>

        <h1>Seu próximo desafio começa aqui.</h1>

        <p className="hero-description">
          Escolha uma meta, participe de onde estiver
          e conquiste novas experiências esportivas.
        </p>

        <Link to="/desafios" className="button-primary">
          Explorar desafios
        </Link>
      </section>

      <section className="page-section" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EM DESTAQUE</span>
            <h2 id="featured-title">Encontre sua próxima meta</h2>
          </div>

          <Link to="/desafios" className="text-link">
            Ver todos
          </Link>
        </div>

        <div className="challenge-grid">
          {featured.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
            />
          ))}
        </div>
      </section>
    </>
  )
}
