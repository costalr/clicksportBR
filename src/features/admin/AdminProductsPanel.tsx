
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  getProductImageUrl,
  listProducts,
  removeProductImage,
  saveProduct,
  uploadProductImage,
  type Product,
} from './adminCatalogService'

type ProductType = Product['tipo']

const emptyForm = {
  nome: '',
  descricao: '',
  tipo: 'fisico' as ProductType,
  imagem_caminho: '',
  ativo: false,
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}
export function AdminProductsPanel() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
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

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  function edit(item: Product) {
    setEditingId(item.id)
    setForm({
      nome: item.nome,
      descricao: item.descricao ?? '',
      tipo: item.tipo,
      imagem_caminho: item.imagem_caminho ?? '',
      ativo: item.ativo,
    })
    setSelectedFile(null)
    setFileInputKey((key) => key + 1)
    setError('')
    setFeedback('')
  }

  function reset() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setSelectedFile(null)
    setFileInputKey((key) => key + 1)
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFile(null)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Selecione uma imagem JPG, PNG ou WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.')
      event.target.value = ''
      return
    }

    setError('')
    setSelectedFile(file)
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

    let uploadedPath: string | null = null

    try {
      if (selectedFile) {
        uploadedPath = await uploadProductImage(selectedFile)
      }

      await saveProduct({
        ...(editingId ? { id: editingId } : {}),
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        tipo: form.tipo,
        imagem_caminho: uploadedPath ?? (form.imagem_caminho.trim() || null),
        ativo: form.ativo,
      })

      setFeedback(editingId ? 'Produto atualizado.' : 'Produto cadastrado.')
      reset()
      await load()
    } catch (saveError) {
      if (uploadedPath) {
        try {
          await removeProductImage(uploadedPath)
        } catch {
          setError('Não foi possível salvar o produto nem remover a imagem enviada. Verifique o Storage.')
          return
        }
      }

      setError(errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const currentImageUrl = getProductImageUrl(form.imagem_caminho || null)
  const displayedImageUrl = previewUrl ?? currentImageUrl

  return (
    <section className="admin-panel" aria-labelledby="admin-products-title">
      <div className="admin-panel-heading">
        <div>
          <h2 id="admin-products-title">Produtos</h2>
          <p>Gerencie os produtos, medalhas e suas fotografias.</p>
        </div>
      </div>

      {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}

      <form className="admin-catalog-form" onSubmit={(event) => void submit(event)}>
        <h3>{editingId ? 'Editar produto' : 'Novo produto'}</h3>

        <label>
          Nome
          <input
            required
            maxLength={160}
            value={form.nome}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
          />
        </label>

        <label>
          Tipo
          <select
            value={form.tipo}
            onChange={(event) => setForm({ ...form, tipo: event.target.value as ProductType })}
          >
            <option value="fisico">Físico</option>
            <option value="digital">Digital</option>
          </select>
        </label>

        <label className="admin-form-wide">
          Descrição
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(event) => setForm({ ...form, descricao: event.target.value })}
          />
        </label>

        <div className="admin-form-wide">
          <label htmlFor="product-image">Fotografia do produto</label>
          <input
            key={fileInputKey}
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectImage}
          />
          <p className="admin-disclaimer">JPG, PNG ou WebP, até 5 MB.</p>

          {displayedImageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <img
                src={displayedImageUrl}
                alt={`Prévia de ${form.nome || 'produto'}`}
                style={{
                  width: '220px',
                  maxWidth: '100%',
                  aspectRatio: '1',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                }}
              />
              <p className="admin-disclaimer">
                {selectedFile ? 'Prévia da nova fotografia' : 'Fotografia atual'}
              </p>
            </div>
          )}
        </div>

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
          />
          Ativo
        </label>

        <div className="admin-form-actions admin-form-wide">
          {editingId && (
            <button className="admin-refresh" type="button" disabled={saving} onClick={reset}>
              Cancelar edição
            </button>
          )}
          <button className="admin-submit" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </form>

      <div className="admin-catalog-list">
        <h3>Produtos cadastrados</h3>

        {loading ? (
          <p className="admin-empty">Carregando produtos...</p>
        ) : items.length === 0 ? (
          <p className="admin-empty">Nenhum produto cadastrado.</p>
        ) : items.map((item) => {
          const imageUrl = getProductImageUrl(item.imagem_caminho)

          return (
            <article className="admin-catalog-row" key={item.id}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={item.nome}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              )}

              <div>
                <strong>{item.nome}</strong>
                <span>
                  {item.tipo === 'fisico' ? 'Físico' : 'Digital'} ·{' '}
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <button
                type="button"
                className="admin-refresh"
                onClick={() => edit(item)}
              >
                Editar
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
