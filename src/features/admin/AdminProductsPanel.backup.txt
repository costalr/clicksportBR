import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { listProducts, saveProduct, type Product } from './adminCatalogService'

type ProductType = Product['tipo']
const emptyForm = { nome: '', descricao: '', tipo: 'fisico' as ProductType, imagem_caminho: '', ativo: false }

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

export function AdminProductsPanel() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const load = useCallback(async () => {
    try {
      setItems(await listProducts())
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    let active = true
    void listProducts()
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

  function edit(item: Product) {
    setEditingId(item.id)
    setForm({
      nome: item.nome,
      descricao: item.descricao ?? '',
      tipo: item.tipo,
      imagem_caminho: item.imagem_caminho ?? '',
      ativo: item.ativo,
    })
    setFeedback('')
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.nome.trim()) {
      setError('Informe o nome do produto.')
      return
    }
    setSaving(true)
    setError('')
    setFeedback('')
    try {
      await saveProduct({
        ...(editingId ? { id: editingId } : {}),
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        tipo: form.tipo,
        imagem_caminho: form.imagem_caminho.trim() || null,
        ativo: form.ativo,
      })
      setFeedback(editingId ? 'Produto atualizado.' : 'Produto cadastrado.')
      reset()
      await load()
    } catch (saveError) {
      setError(errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-products-title">
      <div className="admin-panel-heading">
        <div>
          <h2 id="admin-products-title">Produtos</h2>
          <p>Cadastre referências do catálogo; nenhum produto é criado automaticamente.</p>
        </div>
      </div>

      {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      <form className="admin-catalog-form" onSubmit={(event) => void submit(event)}>
        <h3>{editingId ? 'Editar produto' : 'Novo produto'}</h3>
        <label>
          Nome
          <input required maxLength={160} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
        </label>
        <label>
          Tipo
          <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value as ProductType })}>
            <option value="fisico">Físico</option>
            <option value="digital">Digital</option>
          </select>
        </label>
        <label className="admin-form-wide">
          Descrição
          <textarea rows={3} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
        </label>
        <label className="admin-form-wide">
          Referência/caminho da imagem (opcional)
          <input value={form.imagem_caminho} onChange={(event) => setForm({ ...form, imagem_caminho: event.target.value })} />
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" checked={form.ativo} onChange={(event) => setForm({ ...form, ativo: event.target.checked })} />
          Ativo
        </label>
        <p className="admin-disclaimer admin-form-wide">Upload desativado: não há bucket e política de Storage aprovados para imagens de produtos.</p>
        <div className="admin-form-actions admin-form-wide">
          {editingId && <button className="admin-refresh" type="button" onClick={reset}>Cancelar edição</button>}
          <button className="admin-submit" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar produto'}</button>
        </div>
      </form>

      <div className="admin-catalog-list">
        <h3>Produtos cadastrados</h3>
        {loading ? <p className="admin-empty">Carregando produtos...</p> : items.length === 0
          ? <p className="admin-empty">Nenhum produto cadastrado.</p>
          : items.map((item) => (
            <article className="admin-catalog-row" key={item.id}>
              <div>
                <strong>{item.nome}</strong>
                <span>{item.tipo === 'fisico' ? 'Físico' : 'Digital'} · {item.ativo ? 'Ativo' : 'Inativo'}{item.imagem_caminho ? ` · ${item.imagem_caminho}` : ''}</span>
              </div>
              <button type="button" className="admin-refresh" onClick={() => edit(item)}>Editar</button>
            </article>
          ))}
      </div>
    </section>
  )
}
