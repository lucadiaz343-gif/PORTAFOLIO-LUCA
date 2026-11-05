import type { CSSProperties } from 'react'
import { contacts, CANVAS_H, CANVAS_W } from '../data/contacts'
import { readSavedDocument, type EditorLayer } from '../editor/model'

function styleFor(layer: EditorLayer, width = CANVAS_W, height = CANVAS_H): CSSProperties {
  return {
    left: `${(layer.x / width) * 100}%`,
    top: `${(layer.y / height) * 100}%`,
    width: `${(layer.w / width) * 100}%`,
    height: `${(layer.h / height) * 100}%`,
    zIndex: layer.z,
    visibility: layer.visible ? 'visible' : 'hidden',
    transform: `rotate(${layer.rotation}deg)`,
  }
}

function Hero() {
  const layers = readSavedDocument().portada
  const find = (id: string) => layers.find((layer) => layer.id === id)
  return (
    <main className="stage">
      <h1 className="sr-only">Portafolio — Nano Díaz®</h1>
      {(['folder', 'identity', 'title'] as const).map((id) => {
        const layer = find(id)
        if (!layer?.src) return null
        return <img key={id} className={`art art--${id}`} src={layer.src} alt={layer.name} draggable={false} style={styleFor(layer)} />
      })}
      <header className="topbar" aria-label="Contacto">
        {contacts.map((contact) => {
          const layer = find(contact.id === 'correo' ? 'email' : contact.id)
          return <a key={contact.id} className={`topbar__link contact--${contact.id}`} href={contact.href} aria-label={contact.text}
            {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={layer ? styleFor(layer) : undefined}>
            <img className="topbar__img" src={contact.src} alt={contact.text} draggable={false} />
          </a>
        })}
      </header>
      <div className="meta">
        <span className="meta__update">Update v1.0</span>
        <p className="meta__year" aria-label="2026">{['2','0','2','6'].map((digit,index)=><span key={index} aria-hidden="true">{digit}</span>)}</p>
      </div>
    </main>
  )
}
export default Hero
