import { useEffect, useState } from 'react'
import {
  listAdminChallenges,
  listOffers,
  listProducts,
} from './adminCatalogService'

type Section = 'challenges' | 'products' | 'offers' | 'evidence'

export function AdminOverviewPanel({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const [counts, setCounts] = useState<{ challenges: number; products: number; offers: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void Promise.all([listAdminChallenges(), listProducts(), listOffers()])
      .then(([challenges, products, offers]) => {
        if (active) setCounts({
          challenges: challenges.length,
          products: products.length,
          offers: offers.length,
        })
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o resumo.')
      })
    return () => { active = false }
  }, [])

  return (
    <main className="admin-overview">
      <section className="admin-overview-intro">
        <span className="admin-eyebrow">OPERAÇÃO CLICKSPORTBR</span>
        <h2>Visão geral</h2>
        <p>Gerencie o catálogo e acompanhe a avaliação de comprovantes.</p>
      </section>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <section className="admin-summary" aria-label="Resumo do catálogo">
        <div><span>Desafios</span><strong>{counts?.challenges ?? '—'}</strong></div>
        <div><span>Produtos</span><strong>{counts?.products ?? '—'}</strong></div>
        <div><span>Ofertas e kits</span><strong>{counts?.offers ?? '—'}</strong></div>
        <div><span>Comprovantes</span><strong>Revisão</strong></div>
      </section>
      <section className="admin-overview-links" aria-label="Atalhos">
        <button type="button" onClick={() => onNavigate('challenges')}>Gerenciar desafios <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => onNavigate('products')}>Gerenciar produtos <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => onNavigate('offers')}>Compor ofertas e kits <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={() => onNavigate('evidence')}>Avaliar comprovantes <span aria-hidden="true">↗</span></button>
      </section>
      <p className="admin-disclaimer">A área administrativa não oferece exclusão de desafios e não ativa checkout, pedidos, pagamentos ou inscrições comerciais.</p>
    </main>
  )
}
