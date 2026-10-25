import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './participant-dashboard.css'

type EvidenceStatus = 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado'

interface Evidence {
  id: string
  caminho_arquivo: string
  nome_original_arquivo: string | null
  distancia_informada_km: number | null
  status: EvidenceStatus
  data_atividade: string | null
  versao_atual: number
  reenvios_utilizados: number
}

interface EvidenceReview {
  comprovante_id: string
  versao_comprovante: number | null
  decisao: string
  justificativa: string | null
  motivo_codigo: string | null
  observacao_administrador: string | null
  criado_em: string
}

interface EvidenceEdit {
  evidence: Evidence
  enrollmentId: string
  distance: string
  date: string
  file: File | null
}

interface Challenge {
  id: string
  titulo: string
  distancia_km: number
  modalidade: string
}

interface Enrollment {
  id: string
  status: string
  desafio_id: string
  desafio: Challenge | null
  comprovantes: Evidence[]
}

export function ParticipantDashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [reviews, setReviews] = useState<Record<string, EvidenceReview>>({})
  const [resendEligibility, setResendEligibility] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<EvidenceEdit | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editFeedback, setEditFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
  const [distances, setDistances] = useState<Record<string, string>>({})
  const [activityDates, setActivityDates] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [openingEvidenceId, setOpeningEvidenceId] = useState<string | null>(null)
  const [evidenceError, setEvidenceError] = useState('')
  const [preview, setPreview] = useState<{
    url: string
    name: string
  } | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser()

      if (!active) return

      if (authError || !auth.user) {
        setErrorMessage('Não foi possível identificar sua sessão.')
        setLoading(false)
        return
      }

      const { data: rows, error } = await supabase
        .from('inscricoes')
        .select(`
          id,
          status,
          desafio_id,
          desafio:desafios (
            id,
            titulo,
            distancia_km,
            modalidade
          ),
          comprovantes (
            id,
            caminho_arquivo,
            nome_original_arquivo,
            distancia_informada_km,
            status,
            data_atividade,
            versao_atual,
            reenvios_utilizados
          )
        `)
        .eq('perfil_id', auth.user.id)
        .order('inscrito_em', { ascending: false })

      if (!active) return

      if (error) {
        setErrorMessage('Não foi possível carregar suas inscrições: ' + error.message)
      } else {
        const loaded = (rows ?? []) as unknown as Enrollment[]
        setEnrollments(loaded)

        const evidenceIds = loaded.flatMap((item) =>
          item.comprovantes.map((evidence) => evidence.id)
        )

        if (evidenceIds.length > 0) {
          const { data: reviewRows, error: reviewError } = await supabase
            .from('validacoes')
            .select('comprovante_id, versao_comprovante, decisao, justificativa, motivo_codigo, observacao_administrador, criado_em')
            .in('comprovante_id', evidenceIds)
            .order('criado_em', { ascending: false })

          if (active && !reviewError) {
            const latest: Record<string, EvidenceReview> = {}
            for (const review of (reviewRows ?? []) as EvidenceReview[]) {
              if (!latest[review.comprovante_id]) {
                latest[review.comprovante_id] = review
              }
            }
            setReviews(latest)
          }

          const rejected = loaded.flatMap((item) =>
            item.comprovantes.filter((evidence) =>
              evidence.status === 'rejeitado'
            )
          )

          const eligibilityResults = await Promise.all(
            rejected.map(async (evidence) => {
              const { data, error } = await supabase.rpc(
                'pode_reenviar_comprovante',
                { p_comprovante_id: evidence.id }
              )

              return [evidence.id, !error && data === true] as const
            })
          )

          if (active) {
            setResendEligibility(Object.fromEntries(eligibilityResults))
          }
        }
      }

      setLoading(false)
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  async function handleUpload(inscricaoId: string) {
    setFeedback('')

    const file = selectedFiles[inscricaoId]
    const distance = Number(distances[inscricaoId])
    const date = activityDates[inscricaoId]

    if (!file) {
      setFeedback('Selecione um arquivo.')
      return
    }

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      setFeedback('Utilize JPG, PNG ou PDF.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback('O arquivo deve ter no máximo 10 MB.')
      return
    }

    if (!Number.isFinite(distance) || distance <= 0) {
      setFeedback('Informe uma distância válida.')
      return
    }

    if (!date) {
      setFeedback('Informe a data da atividade.')
      return
    }

    setUploadingId(inscricaoId)

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const filePath = `${inscricaoId}/${crypto.randomUUID()}.${fileExtension}`

    try {
      const { error: storageError } = await supabase.storage
        .from('comprovantes-atividades')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        })

      if (storageError) throw storageError

      const { error: insertError } = await supabase
        .from('comprovantes')
        .insert({
          inscricao_id: inscricaoId,
          caminho_arquivo: filePath,
          nome_original_arquivo: file.name.slice(0, 255),
          distancia_informada_km: distance,
          data_atividade: date,
          status: 'pendente'
        })

      if (insertError) {
        await supabase.storage
          .from('comprovantes-atividades')
          .remove([filePath])
        throw insertError
      }

      setFeedback('Comprovante enviado com sucesso. Aguardando análise.')
      setSelectedFiles((current) => ({ ...current, [inscricaoId]: null }))
      setDistances((current) => ({ ...current, [inscricaoId]: '' }))
      setActivityDates((current) => ({ ...current, [inscricaoId]: '' }))

      const { data: updated } = await supabase
        .from('comprovantes')
        .select('id, caminho_arquivo, nome_original_arquivo, distancia_informada_km, status, data_atividade, versao_atual, reenvios_utilizados')
        .eq('inscricao_id', inscricaoId)

      if (updated) {
        setEnrollments((current) => current.map((item) =>
          item.id === inscricaoId
            ? { ...item, comprovantes: updated as Evidence[] }
            : item
        ))
      }
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Falha ao enviar comprovante.'
      )
    } finally {
      setUploadingId(null)
    }
  }

  function startEdit(evidence: Evidence, enrollmentId: string) {
    setEditFeedback('')
    setEditing({
      evidence,
      enrollmentId,
      distance: String(evidence.distancia_informada_km ?? ''),
      date: evidence.data_atividade ?? '',
      file: null
    })
  }

  async function saveEdit() {
    if (!editing || savingEdit) return

    const { evidence, enrollmentId, file, distance, date } = editing
    const distanceValue = Number(distance)

    if (!Number.isFinite(distanceValue) || distanceValue <= 0) {
      setEditFeedback('Informe uma distância válida.')
      return
    }

    if (!date) {
      setEditFeedback('Informe a data da atividade.')
      return
    }

    if (file && (
      !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      || file.size > 10 * 1024 * 1024
    )) {
      setEditFeedback('Selecione JPG, PNG ou PDF de até 10 MB.')
      return
    }

    setSavingEdit(true)
    setEditFeedback('')

    try {
      let path = evidence.caminho_arquivo
      let name = evidence.nome_original_arquivo

      if (file) {
        const extension = file.name.split('.').pop()?.toLowerCase()
        path = `${enrollmentId}/${evidence.id}/${crypto.randomUUID()}.${extension}`
        name = file.name.slice(0, 255)

        const { error: uploadError } = await supabase.storage
          .from('comprovantes-atividades')
          .upload(path, file, {
            upsert: false,
            contentType: file.type
          })

        if (uploadError) throw uploadError
      }

      const { error: updateError } = await supabase.rpc(
        'alterar_comprovante',
        {
          p_comprovante_id: evidence.id,
          p_caminho_arquivo: path,
          p_nome_original_arquivo: name,
          p_distancia_km: distanceValue,
          p_data_atividade: date
        }
      )

      if (updateError) throw updateError

      const { data: updated, error: refreshError } = await supabase
        .from('comprovantes')
        .select('id, caminho_arquivo, nome_original_arquivo, distancia_informada_km, status, data_atividade, versao_atual, reenvios_utilizados')
        .eq('inscricao_id', enrollmentId)

      if (refreshError) throw refreshError

      setEnrollments((current) => current.map((item) =>
        item.id === enrollmentId
          ? { ...item, comprovantes: (updated ?? []) as Evidence[] }
          : item
      ))

      setEditing(null)
      setFeedback(
        evidence.status === 'rejeitado'
          ? 'Comprovante reenviado para análise.'
          : 'Comprovante atualizado com sucesso.'
      )
    } catch (error) {
      const detail = error && typeof error === 'object'
        && 'message' in error
        ? String(error.message)
        : String(error)

      console.error('Falha ao alterar comprovante:', error)
      setEditFeedback(detail || 'Não foi possível salvar.')

    } finally {
      setSavingEdit(false)
    }
  }

  async function openEvidence(item: Evidence) {
    setEvidenceError('')
    setOpeningEvidenceId(item.id)

    try {
      const { data, error } = await supabase.storage
        .from('comprovantes-atividades')
        .createSignedUrl(item.caminho_arquivo, 60)

      if (error) throw error
      if (!data?.signedUrl) throw new Error('Arquivo indisponível.')

      const extension = item.caminho_arquivo
        .split('.')
        .pop()
        ?.toLowerCase()

      if (extension === 'pdf') {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      } else {
        setPreview({
          url: data.signedUrl,
          name: item.nome_original_arquivo || 'Comprovante da atividade'
        })
      }
    } catch (error) {
      setEvidenceError(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir o comprovante.'
      )
    } finally {
      setOpeningEvidenceId(null)
    }
  }

  function formatActivityDate(value: string | null) {
    if (!value) return 'Data não informada'
    const [year, month, day] = value.split('-')
    return day && month && year
      ? `${day}/${month}/${year}`
      : 'Data não informada'
  }

  return (
    <>
    <main className="participant-page">
      <nav className="participant-breadcrumb" aria-label="Navegação">
        <Link to="/">Início</Link>
        <span aria-hidden="true">/</span>
        <span>Minha área</span>
      </nav>

      <div className="participant-heading">
        <div>
          <p className="participant-eyebrow">Área do participante</p>
          <h1>Meus desafios</h1>
          <p>Acompanhe suas inscrições e atividades validadas.</p>
        </div>
      </div>

      {loading && (
        <section className="participant-panel">
          <p role="status">Carregando suas inscrições...</p>
        </section>
      )}

      {!loading && errorMessage && (
        <section className="participant-panel">
          <h2>Não foi possível carregar os dados</h2>
          <p role="alert">{errorMessage}</p>
        </section>
      )}

      {!loading && !errorMessage && enrollments.length === 0 && (
        <section className="participant-panel">
          <h2>Você ainda não possui inscrições</h2>
          <p>
            Quando você participar de um desafio, poderá acompanhar
            seu progresso e o histórico de atividades aqui.
          </p>
          <Link to="/desafios" className="button-primary">
            Conhecer desafios
          </Link>
        </section>
      )}

      {!loading && !errorMessage && enrollments.map((enrollment) => {
        const challenge = enrollment.desafio
        if (!challenge) return null

        const approvedKm = enrollment.comprovantes
          .filter((item) => item.status === 'aprovado')
          .reduce(
            (total, item) => total + Number(item.distancia_informada_km ?? 0),
            0
          )

        const pendingKm = enrollment.comprovantes
          .filter((item) => item.status === 'pendente')
          .reduce(
            (total, item) => total + Number(item.distancia_informada_km ?? 0),
            0
          )

        const progress = challenge.distancia_km > 0
          ? Math.min(
              100,
              Math.round((approvedKm / Number(challenge.distancia_km)) * 100)
            )
          : 0

        return (
          <div key={enrollment.id}>
            <section className="participant-panel">
              <div className="participant-panel-header">
                <div>
                  <p className="participant-eyebrow">{challenge.modalidade}</p>
                  <h2>{challenge.titulo}</h2>
                </div>
                <span className="participant-status">
                  {enrollment.status.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="participant-metrics">
                <div>
                  <span>Distância aprovada</span>
                  <strong>
                    {approvedKm} de {challenge.distancia_km} km
                  </strong>
                </div>
                <div>
                  <span>Aguardando análise</span>
                  <strong>{pendingKm} km</strong>
                </div>
                <div>
                  <span>Progresso validado</span>
                  <strong>{progress}%</strong>
                </div>
              </div>

              <div
                className="participant-progress"
                role="progressbar"
                aria-label={`Progresso de ${challenge.titulo}`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div style={{ width: `${progress}%` }} />
              </div>

              <p className="participant-note">
                Somente atividades aprovadas contam para o progresso.
              </p>
            </section>

            <section className="participant-panel">
              <h2>Comprovantes de atividade</h2>
              {enrollment.status === 'ativa' && (
                <div className="activity-form">
                  <div className="activity-form-heading">
                    <span className="activity-form-symbol" aria-hidden="true">
                      ↗
                    </span>
                    <div>
                      <h3>Registrar nova atividade</h3>
                      <p>
                        Preencha os dados da sua atividade e envie o comprovante.
                      </p>
                    </div>
                  </div>

                  <div className="activity-form-fields">
                    <label>
                      Distância percorrida
                      <div className="activity-distance-field">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Ex.: 5,50"
                          value={distances[enrollment.id] ?? ''}
                          onChange={(event) => {
                            setFeedback('')
                            setDistances((current) => ({
                              ...current,
                              [enrollment.id]: event.target.value
                            }))
                          }}
                        />
                        <span>km</span>
                      </div>
                    </label>

                    <label>
                      Data da atividade
                      <input
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={activityDates[enrollment.id] ?? ''}
                        onChange={(event) => {
                          setFeedback('')
                          setActivityDates((current) => ({
                            ...current,
                            [enrollment.id]: event.target.value
                          }))
                        }}
                      />
                    </label>
                  </div>

                  <div className="activity-file-zone">
                    <span className="activity-file-symbol" aria-hidden="true">
                      ↑
                    </span>
                    <strong>Anexe o comprovante da atividade</strong>
                    <p>Captura do aplicativo, imagem ou PDF · até 10 MB</p>

                    <label className="activity-file-button">
                      Selecionar arquivo
                      <input
                        type="file"
                        aria-label="Selecionar comprovante"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(event) => {
                          setFeedback('')
                          const file = event.target.files?.[0] ?? null
                          setSelectedFiles((current) => ({
                            ...current,
                            [enrollment.id]: file
                          }))
                        }}
                      />
                    </label>

                    {selectedFiles[enrollment.id] && (
                      <span className="activity-selected-file">
                        {selectedFiles[enrollment.id]?.name}
                      </span>
                    )}
                  </div>

                  <div className="activity-form-footer">
                    <p>O comprovante será analisado pelo organizador.</p>
                    <button
                      type="button"
                      className="participant-submit"
                      disabled={uploadingId !== null}
                      onClick={() => void handleUpload(enrollment.id)}
                    >
                      {uploadingId === enrollment.id
                        ? 'Enviando...'
                        : 'Enviar atividade'}
                    </button>
                  </div>

                  {feedback && (
                    <p className="upload-feedback" role="status">
                      {feedback}
                    </p>
                  )}
                </div>
              )}

              {evidenceError && (
                <p role="alert" className="evidence-error">
                  {evidenceError}
                </p>
              )}

              <h3 className="participant-list-heading">
                Histórico de comprovantes
              </h3>

              {enrollment.comprovantes.length === 0 ? (
                <p>Nenhum comprovante registrado.</p>
              ) : (
                <ul className="participant-evidence-list">
                  {enrollment.comprovantes.map((item) => (
                    <li key={item.id}>
                      <div className="participant-file-info">
                        <strong>
                          {item.nome_original_arquivo
                            || (item.caminho_arquivo.startsWith('demo/')
                              ? 'Comprovante demonstrativo'
                              : 'Comprovante enviado')}
                        </strong>
                        <span>
                          {item.distancia_informada_km === null
                            ? 'Distância não informada'
                            : `${item.distancia_informada_km} km`}
                          {' · '}
                          {formatActivityDate(item.data_atividade)}
                        </span>
                        {item.status === 'rejeitado' && (() => {
                          const review = reviews[item.id]
                          const matchingReview = review
                            && review.versao_comprovante === item.versao_atual
                            && review.decisao === 'rejeitado'

                          return (
                            <div className="evidence-review">
                              <strong>Justificativa da rejeição</strong>
                              {matchingReview && review.motivo_codigo ? (
                                <div className="evidence-review-details">
                                  <div>
                                    <span className="evidence-review-caption">Motivo</span>
                                    <strong>
                                      {{
                                        ilegivel: 'Comprovante ilegível',
                                        distancia: 'Distância não comprovada',
                                        data: 'Data inválida ou divergente',
                                        incompleto: 'Informações insuficientes',
                                        duplicado: 'Comprovante duplicado',
                                        outro: 'Outro motivo',
                                      }[review.motivo_codigo] || 'Motivo informado'}
                                    </strong>
                                  </div>
                                  {review.motivo_codigo !== 'outro' && (
                                    <p>{{
                                      ilegivel: 'A imagem ou documento não permite conferir as informações da atividade.',
                                      distancia: 'A distância informada não corresponde à distância apresentada no comprovante.',
                                      data: 'A data apresentada não corresponde à atividade informada ou ao período permitido.',
                                      incompleto: 'O comprovante não apresenta dados suficientes para validar a atividade.',
                                      duplicado: 'O documento já foi utilizado em outro registro.',
                                    }[review.motivo_codigo]}</p>
                                  )}
                                  {review.observacao_administrador && (
                                    <div className="evidence-review-observation">
                                      <span className="evidence-review-caption">
                                        Observação do administrador
                                      </span>
                                      <p>{review.observacao_administrador}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p>
                                  {matchingReview
                                    ? review.justificativa || 'Justificativa não informada.'
                                    : 'Não há avaliação formal registrada para esta versão.'}
                                </p>
                              )}
                              <span>
                                Reenvios utilizados: {item.reenvios_utilizados} de 3
                              </span>
                            </div>
                          )
                        })()}

                        {enrollment.status === 'ativa'
                          && (item.status === 'pendente'
                            || item.status === 'rejeitado')
                          && !item.caminho_arquivo.startsWith('demo/')
                          && (
                            <>
                              <button
                                type="button"
                                className="evidence-edit-button"
                                disabled={
                                  item.status === 'rejeitado'
                                  && resendEligibility[item.id] !== true
                                }
                                onClick={() => startEdit(item, enrollment.id)}
                              >
                                {item.status === 'rejeitado'
                                  ? 'Reenviar comprovante'
                                  : 'Editar comprovante'}
                              </button>

                              {item.status === 'rejeitado'
                                && resendEligibility[item.id] !== true
                                && (
                                  <span className="evidence-resend-unavailable">
                                    Reenvio indisponível. Caso precise corrigir
                                    este comprovante, contate a administração.
                                  </span>
                                )}
                            </>
                          )}

                        {!item.caminho_arquivo.startsWith('demo/') && (
                          <button
                            type="button"
                            className="evidence-open-button"
                            disabled={openingEvidenceId === item.id}
                            onClick={() => void openEvidence(item)}
                          >
                            {openingEvidenceId === item.id
                              ? 'Abrindo...'
                              : 'Visualizar comprovante'}
                          </button>
                        )}
                      </div>

                      <span className={
                        `participant-evidence-status participant-${item.status}`
                      }>
                        {item.status === 'pendente'
                          ? 'Pendente de análise'
                          : item.status === 'aprovado'
                            ? 'Aprovado'
                            : 'Rejeitado'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}


            </section>
          </div>
        )
      })}
    </main>


    {editing && (
      <div
        className="evidence-modal-backdrop evidence-edit-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingEdit) {
            setEditing(null)
          }
        }}
      >
              {editing && (
                <section className="evidence-edit-form evidence-edit-dialog" aria-label="Editar comprovante">
                  <div className="evidence-edit-heading">
                    <h3>
                      {editing.evidence.status === 'rejeitado'
                        ? 'Reenviar comprovante'
                        : 'Editar comprovante'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      disabled={savingEdit}
                      aria-label="Fechar edição"
                    >
                      ×
                    </button>
                  </div>

                  <div className="activity-form-fields">
                    <label>
                      Distância percorrida (km)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editing.distance}
                        onChange={(event) => setEditing((current) =>
                          current ? { ...current, distance: event.target.value } : null
                        )}
                      />
                    </label>
                    <label>
                      Data da atividade
                      <input
                        type="date"
                        value={editing.date}
                        onChange={(event) => setEditing((current) =>
                          current ? { ...current, date: event.target.value } : null
                        )}
                      />
                    </label>
                  </div>

                  <div className="evidence-edit-file">
                    <strong>Comprovante da atividade</strong>
                    <p>Substituição opcional · JPG, PNG ou PDF · até 10 MB</p>

                    <label className="evidence-file-picker">
                      <span className="evidence-file-picker-action">
                        Selecionar novo arquivo
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        aria-label="Selecionar novo comprovante"
                        onChange={(event) => setEditing((current) =>
                          current
                            ? { ...current, file: event.target.files?.[0] ?? null }
                            : null
                        )}
                      />
                    </label>

                    <span className="evidence-file-name">
                      {editing.file
                        ? editing.file.name
                        : 'Nenhum novo arquivo selecionado. O atual será mantido.'}
                    </span>
                  </div>

                  {editFeedback && <p role="alert">{editFeedback}</p>}

                  <div className="evidence-edit-actions">
                    <button
                      type="button"
                      disabled={savingEdit}
                      onClick={() => setEditing(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="participant-submit"
                      disabled={savingEdit}
                      onClick={() => void saveEdit()}
                    >
                      {savingEdit ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </section>
              )}
      </div>
    )}

    {preview && (
      <div
        className="evidence-modal-backdrop"
        role="presentation"
        onClick={() => setPreview(null)}
      >
        <section
          className="evidence-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar comprovante"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="evidence-modal-header">
            <strong>{preview.name}</strong>
            <button
              type="button"
              className="evidence-modal-close"
              aria-label="Fechar visualizador"
              onClick={() => setPreview(null)}
            >
              ×
            </button>
          </div>

          <div className="evidence-modal-content">
            <img
              src={preview.url}
              alt={preview.name}
            />
          </div>
        </section>
      </div>
    )}
    </>
  )
}
