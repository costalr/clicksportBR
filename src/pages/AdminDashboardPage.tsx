import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './admin-dashboard.css'

type Status = 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado'
type Decision = 'aprovado' | 'rejeitado'

type ReviewDraft = {
  userId: string
  evidenceId: string
  version: number
  decision: Decision
  reason: string
  detail: string
}

const REVIEW_DRAFT_KEY = 'clicksportbr:admin-review-draft:v1'

function readReviewDraft(): ReviewDraft | null {
  try {
    const raw = sessionStorage.getItem(REVIEW_DRAFT_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    const draft = value as Partial<ReviewDraft>
    if (
      typeof draft.userId !== 'string' ||
      typeof draft.evidenceId !== 'string' ||
      !Number.isInteger(draft.version) ||
      (draft.decision !== 'aprovado' && draft.decision !== 'rejeitado') ||
      typeof draft.reason !== 'string' ||
      typeof draft.detail !== 'string'
    ) return null
    return draft as ReviewDraft
  } catch {
    return null
  }
}

function clearReviewDraft() {
  try {
    sessionStorage.removeItem(REVIEW_DRAFT_KEY)
  } catch {
    // Armazenamento indisponível: o painel continua funcionando.
  }
}


type Evidence = {
  id: string
  inscricao_id: string
  status: Status
  versao_atual: number
  distancia_informada_km: number
  data_atividade: string
  caminho_arquivo: string
  nome_original_arquivo: string | null
  criado_em: string
}

type Enrollment = {
  id: string
  perfil_id?: string
  desafio_id?: string
}

type Profile = {
  id: string
  nome?: string
}

type Challenge = {
  id: string
  titulo?: string
  nome?: string
}

const reasons = [
  {
    value: 'ilegivel',
    label: 'Comprovante ilegível',
    description: 'A imagem ou documento não permite conferir as informações da atividade.',
  },
  {
    value: 'distancia',
    label: 'Distância não comprovada',
    description: 'A distância informada não corresponde à distância apresentada no comprovante.',
  },
  {
    value: 'data',
    label: 'Data inválida ou divergente',
    description: 'A data apresentada não corresponde à atividade informada ou ao período permitido.',
  },
  {
    value: 'incompleto',
    label: 'Informações insuficientes',
    description: 'O comprovante não apresenta dados suficientes para validar a atividade.',
  },
  {
    value: 'duplicado',
    label: 'Comprovante duplicado',
    description: 'O documento já foi utilizado em outro registro.',
  },
  {
    value: 'outro',
    label: 'Outro motivo',
    description: '',
  },
]

const labels: Record<Status, string> = {
  pendente: 'Pendente',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Não informada'
  const date = new Date(value.includes('T') ? value : value + 'T12:00:00')
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('pt-BR')
}

export function AdminDashboardPage() {
  const [items, setItems] = useState<Evidence[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filter, setFilter] = useState<Status | 'todos'>('pendente')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Evidence | null>(null)
  const [decision, setDecision] = useState<Decision>('rejeitado')
  const [reason, setReason] = useState('ilegivel')
  const [detail, setDetail] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [draftUserId, setDraftUserId] = useState<string | null>(null)
  const [restoredDraft, setRestoredDraft] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setDraftUserId(data.user?.id ?? null)
    })
    return () => { active = false }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const [evidenceResult, enrollmentResult, profileResult, challengeResult] =
      await Promise.all([
        supabase.from('comprovantes').select('*'),
        supabase.from('inscricoes').select('*'),
        supabase.from('perfis').select('*'),
        supabase.from('desafios').select('*'),
      ])

    const failures = [
      evidenceResult.error,
      enrollmentResult.error,
      profileResult.error,
      challengeResult.error,
    ].filter(Boolean)

    if (failures.length) {
      setError(failures.map((item) => item?.message).join(' | '))
      setLoading(false)
      return
    }

    setItems((evidenceResult.data ?? []) as Evidence[])
    setEnrollments((enrollmentResult.data ?? []) as Enrollment[])
    setProfiles((profileResult.data ?? []) as Profile[])
    setChallenges((challengeResult.data ?? []) as Challenge[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loading || !draftUserId || restoredDraft) return

    setRestoredDraft(true)
    const draft = readReviewDraft()
    if (!draft) return

    if (draft.userId !== draftUserId) {
      clearReviewDraft()
      return
    }

    const evidence = items.find((item) =>
      item.id === draft.evidenceId &&
      item.versao_atual === draft.version &&
      (item.status === 'pendente' || item.status === 'em_analise')
    )

    if (!evidence || !reasons.some((item) => item.value === draft.reason)) {
      clearReviewDraft()
      return
    }

    setSelected(evidence)
    setDecision(draft.decision)
    setReason(draft.reason)
    setDetail(draft.detail)
  }, [loading, draftUserId, restoredDraft, items])

  useEffect(() => {
    if (!selected || !draftUserId || saving) return

    const draft: ReviewDraft = {
      userId: draftUserId,
      evidenceId: selected.id,
      version: selected.versao_atual,
      decision,
      reason,
      detail,
    }

    try {
      sessionStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // A avaliação continua disponível, mesmo sem armazenamento.
    }
  }, [selected, draftUserId, decision, reason, detail, saving])

  function cancelReview() {
    clearReviewDraft()
    setSelected(null)
  }

  function participantName(item: Evidence) {
    const enrollment = enrollments.find((entry) => entry.id === item.inscricao_id)
    const userId = enrollment?.perfil_id
    return profiles.find((entry) => entry.id === userId)?.nome
      ?? 'Participante não identificado'
  }

  function challengeName(item: Evidence) {
    const enrollment = enrollments.find((entry) => entry.id === item.inscricao_id)
    const challenge = challenges.find((entry) => entry.id === enrollment?.desafio_id)
    return challenge?.titulo ?? challenge?.nome ?? 'Desafio'
  }

  function openReview(item: Evidence, nextDecision: Decision) {
    clearReviewDraft()
    setSelected(item)
    setDecision(nextDecision)
    setReason('ilegivel')
    setDetail('')
    setFeedback('')
  }

  async function viewEvidence(item: Evidence) {
    setFeedback('')
    if (!item.caminho_arquivo || item.caminho_arquivo.startsWith('demo/')) {
      setFeedback('Este registro não possui um arquivo real disponível.')
      return
    }

    const { data, error: signedError } = await supabase.storage
      .from('comprovantes-atividades')
      .createSignedUrl(item.caminho_arquivo, 120)

    if (signedError || !data?.signedUrl) {
      setFeedback(signedError?.message ?? 'Não foi possível abrir o comprovante.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function submitReview() {
    if (!selected || saving) return

    const chosenReason = reasons.find((item) => item.value === reason)
    const justification = decision === 'rejeitado'
      ? [chosenReason?.description, detail.trim()].filter(Boolean).join(' ')
      : null

    if (decision === 'rejeitado' && !justification) {
      setFeedback('Informe uma justificativa para a rejeição.')
      return
    }

    setSaving(true)
    setFeedback('')

    const { error: reviewError } = await supabase.rpc('avaliar_comprovante_detalhado', {
      p_comprovante_id: selected.id,
      p_versao: selected.versao_atual,
      p_decisao: decision,
      p_motivo_codigo: decision === 'rejeitado' ? reason : null,
      p_observacao_administrador: decision === 'rejeitado'
        ? detail.trim() || null
        : null,
    })

    setSaving(false)

    if (reviewError) {
      setFeedback(reviewError.message)
      return
    }

    clearReviewDraft()
    setSelected(null)
    setFeedback(
      decision === 'aprovado'
        ? 'Comprovante aprovado com sucesso.'
        : 'Rejeição registrada com sucesso.',
    )
    await load()
  }

  const summary = {
    total: items.length,
    pending: items.filter((item) =>
      item.status === 'pendente' || item.status === 'em_analise'
    ).length,
    approved: items.filter((item) => item.status === 'aprovado').length,
    rejected: items.filter((item) => item.status === 'rejeitado').length,
  }

  const visible = items.filter((item) =>
    filter === 'todos'
    || item.status === filter
    || (filter === 'pendente' && item.status === 'em_analise')
  )

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">ClicksportBR · Administração</p>
          <h1>Painel de validação</h1>
          <p>Analise os comprovantes de atividade dos participantes.</p>
        </div>
        <button type="button" className="admin-refresh" onClick={() => void load()}>
          Atualizar lista
        </button>
      </div>

      <section className="admin-summary" aria-label="Resumo das análises">
        <div><span>Total de comprovantes</span><strong>{summary.total}</strong></div>
        <div><span>Aguardando análise</span><strong>{summary.pending}</strong></div>
        <div><span>Aprovados</span><strong>{summary.approved}</strong></div>
        <div><span>Rejeitados</span><strong>{summary.rejected}</strong></div>
      </section>

      <section className="admin-panel" aria-labelledby="queue-title">
        <div className="admin-panel-heading">
          <div>
            <h2 id="queue-title">Comprovantes recebidos</h2>
            <p>Registros carregados do banco de dados.</p>
          </div>

          <label className="admin-filter">
            Situação
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Status | 'todos')}
            >
              <option value="pendente">Pendentes</option>
              <option value="todos">Todos</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </label>
        </div>

        {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}

        {loading ? (
          <p className="admin-empty">Carregando comprovantes...</p>
        ) : visible.length === 0 ? (
          <p className="admin-empty">Nenhum comprovante nesta situação.</p>
        ) : (
          <div className="admin-submissions">
            {visible.map((item) => (
              <article className="admin-submission" key={item.id}>
                <div className="admin-submission-details">
                  <strong>{participantName(item)}</strong>
                  <span>{challengeName(item)}</span>
                  <span>
                    Arquivo: {item.nome_original_arquivo
                      || item.caminho_arquivo?.split('/').pop()
                      || 'Não informado'}
                  </span>
                  <span>Distância: {item.distancia_informada_km} km</span>
                  <span>Data da atividade: {formatDate(item.data_atividade)}</span>
                  <span>Versão: {item.versao_atual}</span>
                  <button
                    type="button"
                    className="admin-file-link"
                    onClick={() => void viewEvidence(item)}
                  >
                    Visualizar comprovante
                  </button>
                </div>

                <div className="admin-submission-actions">
                  <span className={`admin-status admin-${item.status}`}>
                    {labels[item.status]}
                  </span>

                  {(item.status === 'pendente' || item.status === 'em_analise') && (
                    <div className="admin-buttons">
                      <button
                        type="button"
                        className="admin-approve"
                        onClick={() => openReview(item, 'aprovado')}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="admin-reject"
                        onClick={() => openReview(item, 'rejeitado')}
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="admin-modal-backdrop">
          <section
            className="admin-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-title"
          >
            <h2 id="admin-review-title">Avaliar comprovante</h2>
            <p>{participantName(selected)} · {selected.distancia_informada_km} km · Versão {selected.versao_atual}</p>

            <div className="admin-decision-switch">
              <button
                type="button"
                className={decision === 'aprovado' ? 'selected' : ''}
                onClick={() => setDecision('aprovado')}
                disabled={saving}
              >
                Aprovar
              </button>
              <button
                type="button"
                className={decision === 'rejeitado' ? 'selected' : ''}
                onClick={() => setDecision('rejeitado')}
                disabled={saving}
              >
                Rejeitar
              </button>
            </div>

            {decision === 'rejeitado' && (
              <>
                <fieldset className="admin-reason-fieldset" disabled={saving}>
                  <legend>Motivo da rejeição</legend>
                  <div className="admin-reason-options">
                    {reasons.map((item) => (
                      <label
                        key={item.value}
                        className={`admin-reason-option ${
                          reason === item.value ? 'is-selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="admin-rejection-reason"
                          value={item.value}
                          checked={reason === item.value}
                          onChange={() => setReason(item.value)}
                        />
                        <span className="admin-reason-indicator" aria-hidden="true" />
                        <span className="admin-reason-label">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="admin-review-field">
                  {reason === 'outro'
                    ? 'Justificativa obrigatória'
                    : 'Observação complementar (opcional)'}
                  <textarea
                    rows={3}
                    value={detail}
                    onChange={(event) => setDetail(event.target.value)}
                    disabled={saving}
                    placeholder="Descreva como o participante pode corrigir o comprovante."
                  />
                </label>

                <div className="admin-reason-preview">
                  <strong>Justificativa para o participante</strong>
                  <p>{reasons.find((item) => item.value === reason)?.description
                    || 'Motivo específico informado pelo administrador.'}</p>
                  {detail.trim() && (
                    <p className="admin-preview-observation">
                      <strong>Observação:</strong> {detail.trim()}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="admin-review-actions">
              <button
                type="button"
                onClick={cancelReview}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={decision === 'aprovado' ? 'admin-approve' : 'admin-reject-confirm'}
                onClick={() => void submitReview()}
                disabled={saving || (decision === 'rejeitado'
                  && reason === 'outro' && !detail.trim())}
              >
                {saving ? 'Registrando...' : decision === 'aprovado'
                  ? 'Confirmar aprovação' : 'Confirmar rejeição'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
