import { useState } from 'react'
import {
  getValidationSummary,
  updateSubmissionStatus,
  type Submission,
  type ValidationStatus,
} from '../features/validations/validation'
import './admin-dashboard.css'

const initialSubmissions: Submission[] = [
  {
    id: 'demo-1',
    participant: 'Participante A',
    challenge: 'Desafio de Corrida — 50 km',
    filename: 'corrida-8km.pdf',
    distanceKm: 8,
    submittedAt: '2026-10-24',
    status: 'pendente',
  },
  {
    id: 'demo-2',
    participant: 'Participante B',
    challenge: 'Desafio de Corrida — 50 km',
    filename: 'treino-5km.png',
    distanceKm: 5,
    submittedAt: '2026-10-23',
    status: 'pendente',
  },
  {
    id: 'demo-3',
    participant: 'Participante C',
    challenge: 'Desafio de Corrida — 50 km',
    filename: 'corrida-12km.jpg',
    distanceKm: 12,
    submittedAt: '2026-10-22',
    status: 'aprovado',
  },
  {
    id: 'demo-4',
    participant: 'Participante D',
    challenge: 'Desafio de Corrida — 50 km',
    filename: 'atividade-incompleta.pdf',
    distanceKm: 7,
    submittedAt: '2026-10-21',
    status: 'rejeitado',
  },
]

const labels: Record<ValidationStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}

export function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [filter, setFilter] = useState<ValidationStatus | 'todos'>('pendente')

  const summary = getValidationSummary(submissions)
  const visible = submissions.filter(
    (item) => filter === 'todos' || item.status === filter,
  )

  function decide(id: string, status: 'aprovado' | 'rejeitado') {
    setSubmissions((current) => updateSubmissionStatus(current, id, status))
  }

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">ClicksportBR · Administração</p>
          <h1>Painel de validação</h1>
          <p>Analise os comprovantes de atividade dos participantes.</p>
        </div>
        <span className="admin-demo">Protótipo sem autenticação</span>
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
            <p>Dados fictícios para testar o processo de validação.</p>
          </div>

          <label className="admin-filter">
            Situação
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as ValidationStatus | 'todos')
              }
            >
              <option value="pendente">Pendentes</option>
              <option value="todos">Todos</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="admin-empty">Nenhum comprovante nesta situação.</p>
        ) : (
          <div className="admin-submissions">
            {visible.map((item) => (
              <article className="admin-submission" key={item.id}>
                <div className="admin-submission-details">
                  <strong>{item.participant}</strong>
                  <span>{item.challenge}</span>
                  <span>Arquivo: {item.filename}</span>
                  <span>Distância informada: {item.distanceKm} km</span>
                  <span>Recebido em: {item.submittedAt}</span>
                </div>

                <div className="admin-submission-actions">
                  <span className={`admin-status admin-${item.status}`}>
                    {labels[item.status]}
                  </span>

                  {item.status === 'pendente' && (
                    <div className="admin-buttons">
                      <button
                        type="button"
                        className="admin-approve"
                        onClick={() => decide(item.id, 'aprovado')}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="admin-reject"
                        onClick={() => decide(item.id, 'rejeitado')}
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

        <p className="admin-disclaimer">
          Demonstração local: as decisões não são salvas no banco e desaparecem
          ao atualizar a página. Os arquivos exibidos são fictícios e não podem
          ser abertos. O acesso administrativo real exigirá autenticação e
          autorização no backend.
        </p>
      </section>
    </main>
  )
}
