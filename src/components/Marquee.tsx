import { useEffect, useState, type CSSProperties } from 'react'
import { ORIGINAL_DOCUMENT, readSavedDocument, STORAGE_KEY, type EditorLayer } from '../editor/model'

const UNITS_PER_GROUP = 3
const GROUPS = 2

type ItemId = 'marquee-text' | 'arrow-a' | 'marquee-logo' | 'arrow-b'
type Kind = 'texto' | 'flecha' | 'logo'

/* Orden de la unidad que se repite en la marquesina. */
const ITEMS: { id: ItemId; kind: Kind; src: string }[] = [
  { id: 'marquee-text', kind: 'texto', src: '/assets/marquee-texto.png' },
  { id: 'arrow-a', kind: 'flecha', src: '/assets/marquee-flecha.png' },
  { id: 'marquee-logo', kind: 'logo', src: '/assets/marquee-logo.png' },
  { id: 'arrow-b', kind: 'flecha', src: '/assets/marquee-flecha.png' },
]

/* Geometría original (la del editor sin cambios guardados): una sola fuente de verdad. */
const ORIGINAL = Object.fromEntries(ORIGINAL_DOCUMENT.marquesina.map((layer) => [layer.id, layer])) as Record<string, EditorLayer>

/**
 * Cada pieza son tres cajas:
 *  - slot: ocupa su lugar original en el flujo (así editar tamaños no corre a las demás),
 *  - frame: lleva la posición/tamaño/rotación guardados en el editor y recibe el hover,
 *  - img: es la única que se mueve con el hover (el área sensible no se mueve → sin temblores).
 * Todas las medidas son «px de referencia × var(--u)»; --u = --s × --marquee-k (ver index.css).
 */
function MarqueeItem({ item, layer }: { item: (typeof ITEMS)[number]; layer: EditorLayer }) {
  const original = ORIGINAL[item.id]
  const dx = layer.x - original.x
  const dy = layer.y + layer.h / 2 - (original.y + original.h / 2) // desvío del centro, no del borde superior
  const slot: CSSProperties = {
    width: `calc(${original.w} * var(--u))`,
    height: `calc(${original.h} * var(--u))`,
  }
  const frame: CSSProperties = {
    width: `calc(${layer.w} * var(--u))`,
    height: `calc(${layer.h} * var(--u))`,
    translate: `calc(${dx} * var(--u)) calc(-50% + ${dy} * var(--u))`,
    rotate: `${layer.rotation}deg`,
    zIndex: layer.z,
    visibility: layer.visible ? 'visible' : 'hidden',
  }
  return (
    <span className="marquee__item" style={slot}>
      <span className="marquee__frame" style={frame}>
        <img className={`marquee__art marquee__art--${item.kind}`} src={item.src} alt="" draggable={false} />
      </span>
    </span>
  )
}

function useSavedMarquee() {
  const [layers, setLayers] = useState(() => readSavedDocument().marquesina)
  useEffect(() => {
    // Si guardás en el editor desde otra pestaña, la franja se actualiza sola.
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY) setLayers(readSavedDocument().marquesina)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  return layers
}

export default function Marquee() {
  const layers = useSavedMarquee()
  const byId = new Map(layers.map((layer) => [layer.id, layer]))
  const band = byId.get('band') ?? ORIGINAL.band
  const style = { height: `calc(${band.h} * var(--u))` } as CSSProperties
  return (
    <section className="marquee" aria-label="Nano Díaz® — Portafolio Folder" style={style}>
      <div className="marquee__track">
        {Array.from({ length: GROUPS }, (_, groupIndex) => (
          <div className="marquee__group" key={groupIndex} aria-hidden="true">
            {Array.from({ length: UNITS_PER_GROUP }, (_, unitIndex) =>
              ITEMS.map((item) => <MarqueeItem key={`${unitIndex}-${item.id}`} item={item} layer={byId.get(item.id) ?? ORIGINAL[item.id]} />),
            )}
          </div>
        ))}
      </div>
      <svg className="marquee__defs" aria-hidden="true" focusable="false">
        <filter id="ink-settle" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
        </filter>
      </svg>
      <p className="sr-only">Nano Díaz® — Portafolio Folder</p>
    </section>
  )
}
