export type SectionKey = 'portada' | 'marquesina' | 'presentacion'
export type EditorLayer = {
  id: string
  name: string
  src?: string
  x: number
  y: number
  w: number
  h: number
  z: number
  rotation: number
  visible: boolean
  locked: boolean
  aspect: number
}
export type EditorDocument = Record<SectionKey, EditorLayer[]>

const make = (id: string, name: string, src: string, x: number, y: number, w: number, h: number, z = 1, locked = false): EditorLayer => ({id,name,src,x,y,w,h,z,rotation:0,visible:true,locked,aspect:w/h})

export const ORIGINAL_DOCUMENT: EditorDocument = {
  portada: [
    make('folder','Carpeta','/assets/folder.png',600,119,1155,770,1),
    make('identity','Identidad','/assets/nano-selected-work.png',75,501,265,76,2),
    make('title','Título Portafolio','/assets/portafolio.png',69,747,1544,287,3),
    make('email','Correo','/assets/correo.png',74,54,211,19,4),
    make('instagram','Instagram','/assets/instagram.png',611,55,97,16,4),
    make('behance','Behance','/assets/behance.png',1034,53,322,21,4),
    make('whatsapp','WhatsApp','/assets/whatsapp.png',1681,53,164,20,4),
  ],
  marquesina: [
    make('band','Fondo amarillo','/assets/marquee-fondo.png',0,0,1920,160,0,true),
    make('marquee-text','Texto Folder','/assets/marquee-texto.png',80,61,509,38,1),
    make('arrow-a','Flecha izquierda','/assets/marquee-flecha.png',650,61,72,37,2),
    make('marquee-logo','Logo NANO','/assets/marquee-logo.png',800,22,141,115,1),
    make('arrow-b','Flecha derecha','/assets/marquee-flecha.png',1020,61,72,37,2),
  ],
  presentacion: [
    make('grid','Fondo y cuadrícula','/assets/hoja3/fondo.png',0,0,1920,1080,0,true),
    make('esc','Tecla Esc','/assets/hoja3/Letra%20ESQ.png',39,49,226,213,2),
    make('mp3','Reproductor MP3','/assets/hoja3/Mp3.png',121,0,619,445,2),
    make('play','Botón de reproducción','/assets/hoja3/signo%20play%20mp3.png',325,67,23,22,3),
    make('clips','Clips','/assets/hoja3/Clips.png',1117,-65,276,146,2),
    make('badge','Identificación','/assets/hoja3/HELLO%20MY%20NAME%20IS.png',1420,18,488,311,2),
    make('camera','Cámara vintage','/assets/hoja3/Camara%20vintage.png',1577,-65,332,495,3),
    make('panel','Panel de presentación','/assets/hoja3/rectangulo%20donde%20va%20el%20texto_.png',231,408,1447,347,4),
    make('intro','Texto de presentación','/assets/hoja3/presentacion.png',265,455,1217,256,5),
    make('wallet','Billetera','/assets/hoja3/BILLETERA%20EN%20FORMA%20DE%20FOLDER.png',1295,301,348,300,6),
    make('coffee','Taza de café','/assets/hoja3/taza%20de%20cafe.png',-36,593,240,503,6),
    make('paper','Papel arrugado','/assets/hoja3/bolita%20de%20papel.png',1775,566,80,220,1),
    make('keyboard','Teclado','/assets/hoja3/Teclado.png',1345,709,684,419,6),
    make('markers','Marcadores','/assets/hoja3/Microfibras.png',1110,878,460,335,6),
    make('photoshop','Photoshop','/assets/hoja3/PHOTOSHOP.png',74,913,239,165,3),
    make('after-effects','After Effects','/assets/hoja3/After%20Effect.png',196,913,242,165,3),
    make('premiere','Premiere','/assets/hoja3/Premier.png',320,913,239,170,3),
    make('illustrator','Illustrator','/assets/hoja3/Ilustrautor.png',442,913,233,163,3),
    make('procreate','Procreate','/assets/hoja3/PROCREATE.png',561,913,231,163,3),
    make('audio','Texto de audio','/assets/hoja3/%C2%BFListos%20para%20escuchar%20algo%20de%20musiquita_.png',270,0,100,62,3),
  ],
}

export const STORAGE_KEY = 'nano-portfolio-visual-editor-v1'

/*
 * Composición PUBLICADA: src/editor/composition.json (versionado en el repo).
 * Para publicar lo que editaste: en el editor → «Guardar cambios» →
 * «Descargar configuración» y reemplazá composition.json con ese archivo.
 * En producción el sitio usa SOLO esta composición; en desarrollo, lo guardado
 * en el editor (localStorage) se aplica por encima para poder seguir probando.
 */
import publishedJson from './composition.json'

function merge(base: EditorDocument, saved: Partial<EditorDocument>): EditorDocument {
  return Object.fromEntries(Object.entries(base).map(([key, originals]) => {
    const changes = saved[key as SectionKey]
    if (!Array.isArray(changes)) return [key, structuredClone(originals)]
    const byId = new Map(changes.map((layer) => [layer.id, layer]))
    return [key, originals.map((original) => {
      const prior = byId.get(original.id)
      const layer = {...original,...prior}
      if (key === 'presentacion' && original.id === 'audio' && prior?.x === 231 && prior?.y === -78) { layer.x = original.x; layer.y = original.y }
      return layer
    })]
  })) as EditorDocument
}

const PUBLISHED_DOCUMENT = merge(ORIGINAL_DOCUMENT, publishedJson as Partial<EditorDocument>)

export function readSavedDocument(): EditorDocument {
  if (!import.meta.env.DEV) return structuredClone(PUBLISHED_DOCUMENT)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(PUBLISHED_DOCUMENT)
    return merge(PUBLISHED_DOCUMENT, JSON.parse(raw) as Partial<EditorDocument>)
  } catch {
    return structuredClone(PUBLISHED_DOCUMENT)
  }
}
