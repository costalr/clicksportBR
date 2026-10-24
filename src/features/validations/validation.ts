export type ValidationStatus = 'pendente' | 'aprovado' | 'rejeitado'

export type Submission = {
  id: string
  participant: string
  challenge: string
  filename: string
  distanceKm: number
  submittedAt: string
  status: ValidationStatus
}

export function updateSubmissionStatus(
  submissions: Submission[],
  id: string,
  status: 'aprovado' | 'rejeitado',
): Submission[] {
  return submissions.map((submission) =>
    submission.id === id && submission.status === 'pendente'
      ? { ...submission, status }
      : submission,
  )
}

export function getValidationSummary(submissions: Submission[]) {
  return {
    total: submissions.length,
    pending: submissions.filter((item) => item.status === 'pendente').length,
    approved: submissions.filter((item) => item.status === 'aprovado').length,
    rejected: submissions.filter((item) => item.status === 'rejeitado').length,
  }
}
