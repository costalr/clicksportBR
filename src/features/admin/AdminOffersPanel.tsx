import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  listAdminChallenges,
  listOffers,
  listProducts,
  saveOffer,
  OfferCompositionError,
  type AdminChallenge,
  type Offer,
  type OfferStatus,
  type ParticipationType,
  type Product,
} from './adminCatalogService'

const emptyForm = {
  desafio_id: '',
  nome: '',
  descricao: '',
  preco: '',
  tipo_participacao: 'a_definir' as ParticipationType,
  status: 'rascunho' as OfferStatus,
  ordem_exibicao: '0',
  quantities: {} as Record<string, string>,
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.'
}

export function AdminOffersPanel() {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const load = useCallback(async () => {
    try {
      const [challengeRows, productRows, offerRows] = await Promise.all([
        listAdminChallenges(),
        listProducts(),
        listOffers(),
      ])
      setChallenges(challengeRows)
      setProducts(productRows)
      setOffers(offerRows)
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    let active = true
    void Promise.all([listAdminChallenges(), listProducts(), listOffers()])
      .then(([challengeRows, productRows, offerRows]) => {
        if (!active) return
        setChallenges(challengeRows)
        setProducts(productRows)
        setOffers(offerRows)
      })
      .catch((loadError: unknown) => {
        if (active) setError(errorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  function edit(offer: Offer) {
    const quantities: Record<string, string> = {}
    for (const item of offer.itens) quantities[item.produto_id] = String(item.quantidade)
    setEditingId(offer.id)
    setForm({
      desafio_id: offer.desafio_id,
      nome: offer.nome,
      descricao: offer.descricao ?? '',
      preco: offer.preco === null ? '' : String(offer.preco),
      tipo_participacao: offer.tipo_participacao,
      status: offer.status,
      ordem_exibicao: String(offer.ordem_exibicao),
      quantities,
    })
    setFeedback('')
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = form.preco.trim() === '' ? null : Number(form.preco)
    const order = Number(form.ordem_exibicao)
    const selectedItems = Object.entries(form.quantities)
      .filter(([, quantity]) => quantity.trim() !== '')
      .map(([produto_id, quantity]) => ({ produto_id, quantidade: Number(quantity) }))

    if (!form.desafio_id || !form.nome.trim()) {
      setError('Selecione um desafio e informe o nome da oferta.')
      return
    }
    if ((price !== null && (!Number.isFinite(price) || price < 0)) ||
      (form.status === 'publicada' && price === null)) {
      setError('O preço deve ser válido; ofertas publicadas precisam de preço definido.')
      return
    }
    if (!Number.isInteger(order) || selectedItems.some((item) => !Number.isInteger(item.quantidade) || item.quantidade < 1)) {
      setError('Ordem deve ser um número inteiro e quantidades dos produtos devem ser inteiros maiores que zero.')
      return
    }

    setSaving(true)
    setError('')
    setFeedback('')
    try {
      await saveOffer({
        ...(editingId ? { id: editingId } : {}),
        desafio_id: form.desafio_id,
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco: price,
        tipo_participacao: form.tipo_participacao,
        status: form.status,
        ordem_exibicao: order,
        itens: selectedItems,
      })
      setFeedback(editingId ? 'Oferta atualizada.' : 'Oferta criada como rascunho.')
      reset()
      await load()
    } catch (saveError) {
      if (saveError instanceof OfferCompositionError) {
        setEditingId(saveError.offerId)
      }
      setError(errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-offers-title">
      <div className="admin-panel-heading">
        <div>
          <h2 id="admin-offers-title">Ofertas e kits</h2>
          <p>Componha ofertas associadas a desafios sem ativar checkout ou inscrições.</p>
        </div>
      </div>

      {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {challenges.length === 0 && !loading && <p className="admin-error">Cadastre um desafio antes de criar ofertas.</p>}

      <form className="admin-catalog-form" onSubmit={(event) => void submit(event)}>
        <h3 className="admin-form-wide">{editingId ? 'Editar oferta' : 'Nova oferta'}</h3>
        <label>
          Desafio
          <select required value={form.desafio_id} onChange={(event) => setForm({ ...form, desafio_id: event.target.value })}>
            <option value="">Selecione...</option>
            {challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.titulo}</option>)}
          </select>
        </label>
        <label>
          Nome
          <input required maxLength={160} value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
        </label>
        <label className="admin-form-wide">
          Descrição
          <textarea rows={3} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
        </label>
        <label>
          Preço (BRL, opcional)
          <input type="number" min="0" step="0.01" value={form.preco} onChange={(event) => setForm({ ...form, preco: event.target.value })} />
        </label>
        <label>
          Tipo de participação
          <select value={form.tipo_participacao} onChange={(event) => setForm({ ...form, tipo_participacao: event.target.value as ParticipationType })}>
            <option value="a_definir">A definir</option>
            <option value="digital">Digital</option>
            <option value="fisica">Física</option>
            <option value="mista">Mista</option>
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as OfferStatus })}>
            <option value="rascunho">Rascunho</option>
            <option value="publicada">Publicada</option>
            <option value="suspensa">Suspensa</option>
            <option value="encerrada">Encerrada</option>
          </select>
        </label>
        <label>
          Ordem de exibição
          <input type="number" step="1" value={form.ordem_exibicao} onChange={(event) => setForm({ ...form, ordem_exibicao: event.target.value })} />
        </label>
        <fieldset className="admin-product-picker admin-form-wide">
          <legend>Composição — selecione produtos e quantidades</legend>
          {products.length === 0 ? <p>Nenhum produto cadastrado.</p> : products.map((product) => (
            <label className="admin-product-option" key={product.id}>
              <span>{product.nome} {!product.ativo && <small>(inativo)</small>}</span>
              <input
                aria-label={`Quantidade de ${product.nome}; deixe vazio para não incluir`}
                type="number"
                min="1"
                step="1"
                placeholder="Não incluir"
                value={form.quantities[product.id] ?? ''}
                onChange={(event) => setForm({
                  ...form,
                  quantities: { ...form.quantities, [product.id]: event.target.value },
                })}
              />
            </label>
          ))}
        </fieldset>
        <div className="admin-form-actions admin-form-wide">
          {editingId && <button className="admin-refresh" type="button" onClick={reset}>Cancelar edição</button>}
          <button className="admin-submit" type="submit" disabled={saving || challenges.length === 0}>{saving ? 'Salvando...' : 'Salvar como rascunho / status selecionado'}</button>
        </div>
      </form>

      <div className="admin-catalog-list">
        <h3>Ofertas cadastradas</h3>
        {loading ? <p className="admin-empty">Carregando ofertas...</p> : offers.length === 0
          ? <p className="admin-empty">Nenhuma oferta cadastrada.</p>
          : offers.map((offer) => {
            const challenge = challenges.find((item) => item.id === offer.desafio_id)
            return (
              <article className="admin-catalog-row" key={offer.id}>
                <div>
                  <strong>{offer.nome}</strong>
                  <span>{challenge?.titulo ?? 'Desafio'} · {offer.status} · {offer.preco === null ? 'Sem preço' : `R$ ${offer.preco.toFixed(2)}`} · {offer.itens.length} produto(s)</span>
                </div>
                <button type="button" className="admin-refresh" onClick={() => edit(offer)}>Editar</button>
              </article>
            )
          })}
        <p className="admin-disclaimer">Salvar uma oferta não inicia checkout, pedido, pagamento ou inscrição.</p>
      </div>
    </section>
  )
}
