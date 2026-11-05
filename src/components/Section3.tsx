import { Fragment, useState, type CSSProperties } from 'react'
import { readSavedDocument, type EditorLayer } from '../editor/model'

/* Capas fijas: fondo y panel/texto de presentación no se mueven con el cursor. */
const STATIC_IDS = new Set(['grid', 'panel', 'intro'])

/* Iconos de aplicaciones: más chicos en reposo + etiqueta flotante. */
const APP_NAMES: Record<string, string> = {
  photoshop: 'Photoshop',
  'after-effects': 'After Effects',
  premiere: 'Premiere Pro',
  illustrator: 'Illustrator',
  procreate: 'Procreate',
}

function layerStyle(layer: EditorLayer): CSSProperties {
  return {
    left: `${(layer.x / 1920) * 100}%`,
    top: `${(layer.y / 1080) * 100}%`,
    width: `${(layer.w / 1920) * 100}%`,
    height: `${(layer.h / 1080) * 100}%`,
    zIndex: layer.z,
    visibility: layer.visible ? 'visible' : 'hidden',
    // `rotate` (y no `transform`) deja `transform` libre para el hover sin pisar la rotación del editor.
    rotate: `${layer.rotation}deg`,
  }
}

/* La etiqueta se ancla al borde superior visible del icono (ya reducido) y a su centro. */
function tipStyle(layer: EditorLayer): CSSProperties {
  return {
    left: `${((layer.x + layer.w / 2) / 1920) * 100}%`,
    top: `calc(${(layer.y / 1080) * 100}% + ${(layer.h / 1080) * 100}% * (1 - var(--app-rest)) / 2)`,
  }
}

function Section3() {
  const [layers] = useState(() => readSavedDocument().presentacion)
  return (
    <section className="section-three" aria-label="Presentación de Nano Díaz">
      <div className="section-three__canvas">
        {layers.map((layer, index) => {
          const className = `section-three__layer section-three__layer--${layer.id}`
          if (STATIC_IDS.has(layer.id)) {
            return <img key={layer.id} className={className} src={layer.src ?? ''} alt="" aria-hidden="true" draggable={false} style={layerStyle(layer)} />
          }
          // Caja estática (recibe el hover) + imagen interna (es la que se mueve): evita el temblor en los bordes.
          const art = <img className="section-three__art" src={layer.src ?? ''} alt="" aria-hidden="true" draggable={false} />
          const style = { ...layerStyle(layer), '--tilt': index % 2 ? 1 : -1 } as CSSProperties
          const appName = APP_NAMES[layer.id]
          if (!appName) {
            return <span key={layer.id} className={`${className} section-three__item`} style={style}>{art}</span>
          }
          return (
            <Fragment key={layer.id}>
              <span className={`${className} section-three__item section-three__item--app`} style={style} tabIndex={0} role="img" aria-label={appName}>{art}</span>
              <span className="section-three__tip" aria-hidden="true" style={tipStyle(layer)}>{appName}</span>
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}

export default Section3
