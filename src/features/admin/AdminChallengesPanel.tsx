import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  listAdminChallenges,
  saveChallenge,
  type AdminChallenge,
  type AdminChallengeStatus,
} from './adminCatalogService'

const emptyForm = {
  slug: '',
  titulo: '',
  descricao: '',
  distancia_km: '',
  duracao_dias: '',
  status: 'rascunho' as AdminChallengeStatus,
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

export function AdminChallengesPanel() {
  const [items, setItems] = useState<AdminChallenge[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const load = useCallback(async () => {
    try {
      setItems(await listAdminChallenges())
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void listAdminChallenges()
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  function startEdit(challenge: AdminChallenge) {
    setEditingId(challenge.id)
    setForm({
      slug: challenge.slug,
      titulo: challenge.titulo,
      descricao: challenge.descricao ?? '',
      distancia_km: String(challenge.distancia_km),
      duracao_dias: String(challenge.duracao_dias),
      status: challenge.status,
    })
    setFeedback('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const slug = form.slug.trim()
    const title = form.titulo.trim()
    const distance = Number(form.distancia_km)
    const duration = Number(form.duracao_dias)

    if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError('Informe um título e um slug com letras minúsculas, números e hífens.')
      return
    }
    if (!Number.isFinite(distance) || distance <= 0 || !Number.isInteger(duration) || duration <= 0) {
      setError('Distância e duração devem ser números maiores que zero; duração em dias inteiros.')
      return
    }

    setSaving(true)
    setError('')
    setFeedback('')
    try {
      await saveChallenge({
        ...(editingId ? { id: editingId } : {}),
        slug,
        titulo: title,
        descricao: form.descricao.trim() || null,
        modalidade: 'corrida',
        distancia_km: distance,
        duracao_dias: duration,
        status: form.status,
      })
      setFeedback(editingId ? 'Desafio atualizado.' : 'Desafio criado como rascunho.')
      cancelEdit()
      await load()
    } catch (saveError) {
      const dbError = saveError as { code?: string }
      setError(dbError.code === '23505'
        ? 'Esse slug já está em uso. Escolha outro.'
        : errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-challenges-title">
      <div className="admin-panel-heading">
        <div>
          <h2 id="admin-challenges-title">Desafios</h2>
          <p>Gerencie o catálogo de desafios. O status publicado não ativa compras.</p>
        </div>
      </div>

      {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      <form className="admin-catalog-form" onSubmit={(event) => void submit(event)}>
        <h3>{editingId ? 'Editar desafio' : 'Novo desafio'}</h3>
        <label>
          Título
          <input required maxLength={160} value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} />
        </label>
        <label>
          Slug
          <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
        </label>
        <label className="admin-form-wide">
          Descrição
          <textarea rows={3} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
        </label>
        <label>
          Distância (km)
          <input required type="number" min="0.01" step="0.01" value={form.distancia_km} onChange={(event) => setForm({ ...form, distancia_km: event.target.value })} />
        </label>
        <label>
          Duração (dias)
          <input required type="number" min="1" step="1" value={form.duracao_dias} onChange={(event) => setForm({ ...form, duracao_dias: event.target.value })} />
        </label>
        <label>
          Modalidade
          <input value="Corrida" disabled />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminChallengeStatus })}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </label>
        <div className="admin-form-actions admin-form-wide">
          {editingId && <button className="admin-refresh" type="button" onClick={cancelEdit}>Cancelar edição</button>}
          <button className="admin-submit" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar desafio'}</button>
        </div>
      </form>

      <div className="admin-catalog-list">
        <h3>Desafios cadastrados</h3>
        {loading ? <p className="admin-empty">Carregando desafios...</p> : items.length === 0
          ? <p className="admin-empty">Nenhum desafio cadastrado.</p>
          : items.map((item) => (
            <article className="admin-catalog-row" key={item.id}>
              <div>
                <strong>{item.titulo}</strong>
                <span>{item.slug} · {item.distancia_km} km · {item.duracao_dias} dias · {item.status}</span>
              </div>
              <div className="admin-form-actions">
              <button
                type="button"
                className="admin-refresh"
                onClick={() => startEdit(item)}
              >
                Editar
              </button>

              <Link
                to={`/admin/preview/${encodeURIComponent(item.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-refresh"
              >
                Pré-visualizar ↗
              </Link>
            </div>
            </article>
          ))}
        <p className="admin-disclaimer">Desafios com inscrições associadas não podem ser excluídos. Esta versão não oferece exclusão.</p>
      </div>
    </section>
  )
}
