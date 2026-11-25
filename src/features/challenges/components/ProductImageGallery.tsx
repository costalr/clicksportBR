
import { useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import './product-image-gallery.css'

type GalleryImage = {
  url: string
  alt: string
}

type ProductImageGalleryProps = {
  images: GalleryImage[]
}

export function ProductImageGallery({
  images,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zooming, setZooming] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [expanded, setExpanded] = useState(false)

  const selectedImage = images[selectedIndex]

  if (!selectedImage) {
    return (
      <div className="pig-empty">
        <span aria-hidden="true">✦</span>
        <p>Imagem da medalha em preparação</p>
      </div>
    )
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return

    const bounds = event.currentTarget.getBoundingClientRect()

    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  const imageStyle: CSSProperties = {
    transformOrigin: `${position.x}% ${position.y}%`,
    transform: zooming ? 'scale(2)' : 'scale(1)',
  }

  return (
    <div className="pig-gallery">
      <div
        className={`pig-stage ${zooming ? 'pig-zooming' : ''}`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') {
            setZooming(true)
          }
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setZooming(false)}
        onClick={() => {
          setZooming(false)
          setExpanded(true)
        }}
      >
        <img
          src={selectedImage.url}
          alt={selectedImage.alt}
          className="pig-image"
          style={imageStyle}
          draggable={false}
        />

        <span className="pig-zoom-hint">
          ⌕ Passe o mouse para ampliar
        </span>
      </div>

      {images.length > 1 && (
        <div className="pig-thumbnails" aria-label="Imagens do produto">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              className={`pig-thumbnail ${
                selectedIndex === index ? 'pig-selected' : ''
              }`}
              onClick={() => {
                setSelectedIndex(index)
                setZooming(false)
                setPosition({ x: 50, y: 50 })
              }}
              aria-label={`Visualizar imagem ${index + 1}`}
              aria-pressed={selectedIndex === index}
            >
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div
          className="pig-overlay"
          role="presentation"
          onClick={() => setExpanded(false)}
        >
          <div
            className="pig-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da medalha"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="pig-close"
              onClick={() => setExpanded(false)}
              aria-label="Fechar imagem ampliada"
            >
              ×
            </button>

            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="pig-expanded-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}
