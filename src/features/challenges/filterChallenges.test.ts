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
    const results = filterChallenges(mockChallenges, '', 'Todas')

    expect(results).toHaveLength(mockChallenges.length)
    expect(results).toEqual(mockChallenges)
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

    expect(results.map((challenge) => challenge.name)).toEqual([
      'Desafio Superação',
      'Ultra Superação',
    ])

    expect(
      results.every((challenge) => challenge.modality === 'Corrida')
    ).toBe(true)
  })

  it('retorna lista vazia quando não encontra resultados', () => {
    expect(
      filterChallenges(mockChallenges, 'inexistente', 'Todas')
    ).toEqual([])
  })

  it('preserva os dados originais ao filtrar', () => {
    const original = [...mockChallenges]

    filterChallenges(mockChallenges, 'corrida', 'Todas')

    expect(mockChallenges).toEqual(original)
  })
})
