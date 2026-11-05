/**
 * Datos de la franja superior de contactos.
 *
 * Las coordenadas x/y/w/h se conservan aquí como documentación de la
 * mesa original de Photoshop (1920 × 1080). El posicionamiento real
 * lo implementan las clases .contact--* en src/index.css, que aplican
 * la capa perimetral adaptable (margen 74 px + huecos iguales) y
 * reproducen exactamente estas coordenadas en viewports 16:9.
 */
export interface Contact {
  id: string
  /** Texto visible en el PNG (también se usa como texto alternativo). */
  text: string
  href: string
  /** Abrir en pestaña nueva (redes externas). */
  external?: boolean
  src: string
  /** Posición y tamaño en el lienzo de referencia 1920 × 1080. */
  x: number
  y: number
  w: number
  h: number
}

export const CANVAS_W = 1920
export const CANVAS_H = 1080

export const contacts: Contact[] = [
  {
    id: 'correo',
    text: 'lucadiaz343@gmail.com',
    href: 'mailto:lucadiaz343@gmail.com',
    src: '/assets/correo.png',
    x: 74, y: 54, w: 211, h: 19,
  },
  {
    id: 'instagram',
    text: '@naanoo.s',
    href: 'https://www.instagram.com/naanoo.s/',
    external: true,
    src: '/assets/instagram.png',
    x: 611, y: 55, w: 97, h: 16,
  },
  {
    id: 'behance',
    text: 'https://www.behance.net/agustndiazl',
    href: 'https://www.behance.net/agustndiaz1',
    external: true,
    src: '/assets/behance.png',
    x: 1034, y: 53, w: 322, h: 21,
  },
  {
    id: 'whatsapp',
    text: '(+54) 9 2612309978',
    href: 'tel:+5492612309978',
    src: '/assets/whatsapp.png',
    x: 1681, y: 53, w: 164, h: 20,
  },
]
