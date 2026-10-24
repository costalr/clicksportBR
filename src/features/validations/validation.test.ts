import { describe, expect, it } from 'vitest'
import {
  getValidationSummary,
  updateSubmissionStatus,
  type Submission,
} from './validation'

const sample: Submission[] = [
  {
    id: '1',
    participant: 'Participante A',
    challenge: 'Corrida 50 km',
    filename: 'corrida.png',
    distanceKm: 5,
    submittedAt: '2026-10-24',
    status: 'pendente',
  },
  {
    id: '2',
    participant: 'Participante B',
    challenge: 'Corrida 50 km',
    filename: 'atividade.pdf',
    distanceKm: 10,
    submittedAt: '2026-10-23',
    status: 'aprovado',
  },
]

describe('validação de comprovantes', () => {
  it('aprova um comprovante pendente', () => {
    const result = updateSubmissionStatus(sample, '1', 'aprovado')
    expect(result[0].status).toBe('aprovado')
    expect(sample[0].status).toBe('pendente')
  })

  it('não altera uma decisão já registrada', () => {
    const result = updateSubmissionStatus(sample, '2', 'rejeitado')
    expect(result[1].status).toBe('aprovado')
  })

  it('mantém os demais registros inalterados', () => {
    const result = updateSubmissionStatus(sample, '1', 'rejeitado')
    expect(result[1]).toEqual(sample[1])
  })

  it('calcula o resumo dos comprovantes', () => {
    expect(getValidationSummary(sample)).toEqual({
      total: 2,
      pending: 1,
      approved: 1,
      rejected: 0,
    })
  })
})
