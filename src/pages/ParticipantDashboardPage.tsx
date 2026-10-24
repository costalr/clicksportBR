import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import './participant-dashboard.css'

type EvidenceStatus = 'pendente' | 'aprovado' | 'rejeitado'

type Evidence = {
  id: string
  filename: string
  distanceKm: number | null
  status: EvidenceStatus
}

const initialEvidence: Evidence[] = [
  {
    id: 'demo-1',
    filename: 'corrida-12km.png',
    distanceKm: 12,
    status: 'aprovado',
  },
  {
    id: 'demo-2',
    filename: 'corrida-8km.pdf',
    distanceKm: 8,
    status: 'pendente',
  },
  {
    id: 'demo-3',
    filename: 'atividade-incompleta.jpg',
    distanceKm: 5,
    status: 'rejeitado',
  },
]

const statusLabels: Record<EvidenceStatus, string> = {
  pendente: 'Pendente de análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}

const challengeDistanceKm = 50

export function ParticipantDashboardPage() {
  const [evidence, setEvidence] = useState(initialEvidence)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const approvedKm = evidence
    .filter((item) => item.status === 'aprovado')
    .reduce((total, item) => total + (item.distanceKm ?? 0), 0)

  const pendingKm = evidence
    .filter((item) => item.status === 'pendente')
    .reduce((total, item) => total + (item.distanceKm ?? 0), 0)

  const progress = Math.min(
    100,
    Math.round((approvedKm / challengeDistanceKm) * 100),
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setMessage('')
    setSelectedFile(null)

    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

    if (!allowedTypes.includes(file.type)) {
      setMessage('Formato inválido. Utilize JPG, PNG ou PDF.')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('O arquivo deve ter no máximo 10 MB.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  function handleDemoUpload() {
    if (!selectedFile) {
      setMessage('Selecione um comprovante antes de continuar.')
      return
    }

    setEvidence((current) => [
      {
        id: crypto.randomUUID(),
        filename: selectedFile.name,
        distanceKm: null,
        status: 'pendente',
      },
      ...current,
    ])

    setSelectedFile(null)
    setMessage(
      'Comprovante adicionado à demonstração. Nenhum arquivo foi enviado ao servidor.',
    )
  }

  return (
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
          <p>Acompanhe seu progresso e a análise das atividades.</p>
        </div>
        <span className="participant-demo">Demonstração</span>
      </div>

      <section className="participant-panel" aria-labelledby="challenge-title">
        <div className="participant-panel-header">
          <div>
            <p className="participant-eyebrow">Corrida individual</p>
            <h2 id="challenge-title">Desafio de Corrida — 50 km</h2>
          </div>
          <span className="participant-status">Em andamento</span>
        </div>

        <div className="participant-metrics">
          <div>
            <span>Distância aprovada</span>
            <strong>{approvedKm} de {challengeDistanceKm} km</strong>
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
          aria-label="Progresso validado do desafio"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${progress}%` }} />
        </div>

        <p className="participant-note">
          Somente atividades aprovadas contam para o progresso.
          Valores e situações desta página são ilustrativos.
        </p>
      </section>

      <section className="participant-panel" aria-labelledby="evidence-title">
        <div className="participant-panel-header">
          <div>
            <h2 id="evidence-title">Comprovantes de atividade</h2>
            <p>Selecione um arquivo para simular o envio.</p>
          </div>
        </div>

        <div className="participant-upload-area">
          <span className="participant-upload-icon" aria-hidden="true">↑</span>
          <strong>Adicionar comprovante</strong>
          <span>JPG, PNG ou PDF · até 10 MB</span>

          <input
            aria-label="Selecionar arquivo de comprovante"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p className="participant-selected">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            className="participant-submit"
            onClick={handleDemoUpload}
            disabled={!selectedFile}
          >
            Adicionar à demonstração
          </button>
        </div>

        {message && (
          <p className="participant-feedback" role="status">
            {message}
          </p>
        )}

        <h3 className="participant-list-heading">Histórico de comprovantes</h3>

        <ul className="participant-evidence-list">
          {evidence.map((item) => (
            <li key={item.id}>
              <div className="participant-file-info">
                <strong>{item.filename}</strong>
                <span>
                  {item.distanceKm === null
                    ? 'Distância não informada'
                    : `${item.distanceKm} km`}
                </span>
              </div>

              <span className={`participant-evidence-status participant-${item.status}`}>
                {statusLabels[item.status]}
              </span>
            </li>
          ))}
        </ul>

        <p className="participant-note">
          Protótipo local: os arquivos não são armazenados nem enviados
          ao organizador. A validação e o registro de distâncias serão
          implementados após a integração com o backend.
        </p>
      </section>
    </main>
  )
}
