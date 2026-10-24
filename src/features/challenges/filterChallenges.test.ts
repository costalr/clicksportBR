import { describe, expect, it } from 'vitest'
import { mockChallenges } from './mockChallenges'
import { filterChallenges, normalizeText } from './filterChallenges'

describe('normalizeText', () => {
  it('remove diferenças de acentuação e maiúsculas', () => {
    expect(normalizeText(' RESISTÊNCIA ')).toBe('resistencia')
  })
})

describe('filterChallenges', () => {
  it('retorna todos os desafios sem filtros', () => {
    expect(
      filterChallenges(mockChallenges, '', 'Todas')
    ).toHaveLength(3)
  })

  it('encontra desafios sem exigir acentos', () => {
    const results = filterChallenges(
      mockChallenges,
      'resistencia',
      'Todas'
    )

    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Desafio Resistência')
  })

  it('filtra por modalidade', () => {
    const results = filterChallenges(
      mockChallenges,
      '',
      'Caminhada'
    )

    expect(results).toHaveLength(1)
    expect(results[0].modality).toBe('Caminhada')
  })

  it('combina busca e modalidade', () => {
    const results = filterChallenges(
      mockChallenges,
      'superacao',
      'Corrida'
    )

    expect(results).toHaveLength(1)
  })

  it('retorna lista vazia quando não encontra resultados', () => {
    expect(
      filterChallenges(mockChallenges, 'inexistente', 'Todas')
    ).toEqual([])
  })
})
