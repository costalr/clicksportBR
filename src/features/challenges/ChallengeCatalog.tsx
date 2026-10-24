import { useMemo, useState } from 'react'
import { ChallengeCard } from './ChallengeCard'
import { mockChallenges } from './mockChallenges'
import type { ChallengeModality } from './types'

type ModalityFilter = 'Todas' | ChallengeModality

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

export function ChallengeCatalog() {
  const [search, setSearch] = useState('')
  const [modality, setModality] = useState<ModalityFilter>('Todas')

  const filteredChallenges = useMemo(() => {
    const term = normalizeText(search)

    return mockChallenges.filter((challenge) => {
      const matchesName = normalizeText(challenge.name).includes(term)
      const matchesModality =
        modality === 'Todas' || challenge.modality === modality

      return matchesName && matchesModality
    })
  }, [search, modality])

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

          {(['Todas', 'Corrida', 'Caminhada'] as const).map((item) => (
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

      <p className="result-count" role="status">
        {filteredChallenges.length}{' '}
        {filteredChallenges.length === 1
          ? 'desafio encontrado'
          : 'desafios encontrados'}
      </p>

      {filteredChallenges.length > 0 ? (
        <div className="challenge-grid">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nenhum desafio encontrado</h2>
          <p>Tente outro nome ou modalidade.</p>
          <button
            type="button"
            className="button-secondary"
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
      )}

      <p className="demo-notice">
        Desafios demonstrativos. Nenhuma inscrição ou pagamento está ativo.
      </p>
    </section>
  )
}
