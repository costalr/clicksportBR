import { useEffect, useMemo, useState } from 'react'
import { ChallengeCard } from './ChallengeCard'
import { listChallenges } from './services/challengeService'
import { filterChallenges } from './filterChallenges'
import type { ModalityFilter } from './filterChallenges'

export function ChallengeCatalog() {
  const [challenges, setChallenges] = useState<Awaited<ReturnType<typeof listChallenges>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modality, setModality] = useState<ModalityFilter>('Todas')

  useEffect(() => {
    let active = true
    void listChallenges()
      .then((result) => {
        if (active) setChallenges(result)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os desafios.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filteredChallenges = useMemo(() => {
    return filterChallenges(
      challenges,
      search,
      modality
    )
  }, [challenges, search, modality])

  function clearFilters() {
    setSearch('')
    setModality('Todas')
  }

  return (
    <section aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ENCONTRE SUA META</span>
          <h1 id="catalog-title">Explore os desafios</h1>
          <p>Escolha um desafio e conheça as condições de participação.</p>
        </div>
      </div>

      <div className="catalog-filters">
        <label htmlFor="challenge-search">Buscar desafios</label>

        <input
          id="challenge-search"
          type="search"
          placeholder="Digite o nome do desafio..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <fieldset className="modality-filters">
          <legend>Modalidade</legend>

          {(['Todas', 'Corrida'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={modality === item ? 'filter-active' : ''}
              aria-pressed={modality === item}
              onClick={() => setModality(item)}
            >
              {item}
            </button>
          ))}
        </fieldset>
      </div>

      {error && <p className="catalog-error" role="alert">{error}</p>}
      {loading ? (
        <p className="catalog-state" role="status">Carregando desafios...</p>
      ) : !error ? (
        <>
          <p className="result-count" role="status">
            {filteredChallenges.length}{' '}
            {filteredChallenges.length === 1
              ? 'desafio encontrado'
              : 'desafios encontrados'}
          </p>

          {filteredChallenges.length > 0 ? (
            <div className="challenge-grid">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>{challenges.length === 0 ? 'Nenhum desafio publicado' : 'Nenhum desafio encontrado'}</h2>
              <p>{challenges.length === 0
                ? 'Novos desafios serão exibidos aqui quando forem publicados.'
                : 'Tente outro nome ou modalidade.'}</p>
              {challenges.length > 0 && (
                <button type="button" className="button-secondary" onClick={clearFilters}>
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
