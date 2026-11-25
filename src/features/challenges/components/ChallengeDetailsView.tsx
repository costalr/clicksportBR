import { Link } from 'react-router-dom'
import type { Challenge } from '../types'
import type { ChallengeOffer } from '../services/challengeOfferService'
import '../../../pages/challenge-details.css'
import { ProductImageGallery } from './ProductImageGallery'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ChallengeDetailsViewProps = {
  challenge: Challenge
  offers: ChallengeOffer[]
  isPreview?: boolean
}

export function ChallengeDetailsView({
  challenge,
  offers,
  isPreview = false,
}: ChallengeDetailsViewProps) {

  const featuredProduct = offers
  .flatMap((offer) => offer.products)
  .find((product) => Boolean(product.imageUrl))

const galleryImages = featuredProduct?.imageUrl
  ? [
      {
        url: featuredProduct.imageUrl,
        alt: featuredProduct.name,
      },
    ]
  : []

  const featuredOffer = offers.length === 1 ? offers[0] : null

const lowestPrice =
  offers.length > 0
    ? Math.min(...offers.map((offer) => offer.price))
    : null

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  return (
    <main className="cd-page">
      <div className="cd-container">
        {!isPreview && (
        <Link to="/desafios" className="cd-back">
          <span aria-hidden="true">←</span>
          Voltar aos desafios
        </Link>
)}

       <section className="cd-hero cd-hero-product" aria-labelledby="cd-title">
  <div className="cd-hero-heading">
    <div className="cd-kicker">
      <span className="cd-kicker-dot" />
      CLICKSPORTBR / {challenge.modality.toUpperCase()}
    </div>

    <span className="cd-status">
      {isPreview
        ? 'Pré-visualização administrativa · inscrições desabilitadas'
        : 'Desafio publicado · participação indisponível'}
    </span>

<h1 id="cd-title" className="cd-display-title">
  <span className="cd-display-title-name">
    {challenge.name.replace(/\s*[-–—]\s*\d+\s*km\s*$/i, '')}
  </span>

  <span className="cd-display-title-distance">
    {challenge.distanceKm} <em>KM.</em>
  </span>
</h1>
  </div>

  <div className="cd-hero-gallery">
    <ProductImageGallery images={galleryImages} />
  </div>

  <div className="cd-hero-details">
    <p className="cd-lead">
      Uma conquista construída quilômetro por quilômetro.
    </p>

<p className="cd-description">
  Corra no seu ritmo, onde quiser, e acumule quilômetros
  até conquistar sua medalha exclusiva ClicksportBR.
</p>

   <div className="cd-hero-facts">
    <div>
      <span>MODALIDADE</span>
      <strong className="cd-fact-modality">
        {challenge.modality}
      </strong>
    </div>

    <div>
      <span>PRAZO PARA CONCLUIR</span>
      <strong>
        {challenge.durationDays} <small>dias</small>
      </strong>
    </div>
  </div>

    <div className="cd-hero-purchase">
  <div className="cd-purchase-heading">
    <span className="cd-purchase-kicker">
      SUA PRÓXIMA CONQUISTA
    </span>

    <span className="cd-purchase-availability">
      <span className="cd-availability-dot" />
      Em breve
    </span>
  </div>

  {featuredOffer && (
    <p className="cd-hero-offer-name">
      {featuredOffer.name}
    </p>
  )}

  {lowestPrice !== null ? (
    <div className="cd-purchase-price-group">
      {offers.length > 1 && (
        <span className="cd-hero-price-label">
          A PARTIR DE
        </span>
      )}

      <div className="cd-purchase-price-row">
        <strong className="cd-hero-price">
          {formatPrice(lowestPrice)}
        </strong>

        <span className="cd-purchase-unit">
          / inscrição
        </span>
      </div>
    </div>
  ) : (
    <p className="cd-purchase-empty">
      Ofertas disponíveis em breve.
    </p>
  )}

<button
  type="button"
  className="cd-disabled-action cd-purchase-button"
  disabled
>
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>

  Inscrições em preparação
</button>

  {offers.length > 1 && (
    <a href="#ofertas" className="cd-hero-offers-link">
      Ver opções de participação ↓
    </a>
  )}
</div>

    <a href="#sobre" className="cd-hero-about-link">
      Conhecer o desafio ↗
    </a>
  </div>
</section>

{offers.length > 1 && (
  <section
    id="ofertas"
    className="cd-offers"
    aria-labelledby="cd-offers-title"
  >
  <div className="cd-offers-heading">
    <div>
      <span className="cd-section-label">
        EXPERIÊNCIA CLICKSPORTBR
      </span>

      <h2 id="cd-offers-title">
        Escolha sua experiência.
      </h2>

      <p>
        Conheça as modalidades de participação,
        os produtos e os valores disponíveis.
      </p>
    </div>

    <span className="cd-offers-state">
      {offers.length > 0
        ? `${offers.length} oferta(s)`
        : 'Inscrições indisponíveis'}
    </span>
  </div>

  {offers.length === 0 ? (
    <div className="cd-offers-grid">
      <div className="cd-offers-product">
        <div className="cd-offers-product-icon" aria-hidden="true">
          ✦
        </div>

        <strong>Produtos e kits</strong>

        <p>
          {isPreview
            ? 'Nenhuma oferta cadastrada para este desafio.'
            : 'Nenhuma oferta publicada está disponível para este desafio.'}
        </p>
      </div>

      <div className="cd-offers-options">
        <span className="cd-section-label">PARTICIPAÇÃO</span>

        <h3>Inscrições indisponíveis</h3>

        <p>
          As opções de participação serão divulgadas
          em breve.
        </p>

        <button
          type="button"
          disabled
          className="cd-disabled-action"
        >
          Inscrições indisponíveis
        </button>
      </div>
    </div>
  ) : (
    offers.map((offer) => (
      <div className="cd-offers-grid" key={offer.id}>
        <div className="cd-offers-product">
          {offer.products.length > 0 ? (
            offer.products.map((product) => (
              <div key={product.id}>
                

                <strong className="cd-medal-name">
                  {product.name}
                </strong>

                {product.description && (
                  <p>{product.description}</p>
                )}

                {product.quantity > 1 && (
                  <span>
                    Quantidade: {product.quantity}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p>
              {isPreview
              ? 'Nenhum produto associado a esta oferta.'
              : 'Nenhum produto ativo associado a esta oferta.'}
            </p>
          )}
        </div>

        <div className="cd-offers-options">
          <span className="cd-section-label">
            PARTICIPAÇÃO
          </span>

          <h3>{offer.name}</h3>

          {offer.description && (
            <p>{offer.description}</p>
          )}

          <p>
            {offer.participationType === 'fisica'
              ? 'Participação com produto físico'
              : offer.participationType === 'digital'
                ? 'Participação digital'
                : 'Participação mista'}
          </p>

          <div className="cd-offers-price">
            <span>VALOR</span>

            <strong>
            {offer.price.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </strong>
          </div>

          <button
            type="button"
            disabled
            className="cd-disabled-action"
          >
            Inscrições em preparação
          </button>

          <small>
            O processo de inscrição e pagamento
            ainda não está disponível.
          </small>
        </div>
      </div>
    ))
  )}
  </section>
)}

<section id="sobre" className="cd-content">
          <div className="cd-about">
            <span className="cd-section-label">SOBRE O DESAFIO</span>
        <h2 className="cd-section-display">
          Uma meta.
          <span>Seu ritmo.</span>
        </h2>            
       <div className="cd-about-description">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="cd-editorial-title">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="cd-editorial-heading">{children}</h2>
              ),
              ul: ({ children }) => (
                <ul className="cd-editorial-list">{children}</ul>
              ),
            }}
          >
            {challenge.description ?? ''}
          </ReactMarkdown>
        </div>
          </div>
        </section>

        <section className="cd-outro">
          <span>GO BEYOND</span>
          <h2>Não é sobre ser o mais rápido. É sobre ir além.</h2>
          <Link to="/desafios">
            Descobrir outros desafios <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </main>
  )
}
