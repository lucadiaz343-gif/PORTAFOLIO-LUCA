import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ORIGINAL_DOCUMENT, readSavedDocument, STORAGE_KEY, type EditorDocument, type EditorLayer, type SectionKey } from './model'
import './visual-editor.css'

const sectionInfo: Record<SectionKey, { label: string; height: number }> = {
  portada: { label: 'Sección 1 · Portada', height: 1080 },
  marquesina: { label: 'Sección 2 · Marquesina', height: 160 },
  presentacion: { label: 'Sección 3 · Presentación', height: 1080 },
}
const sectionOrder: SectionKey[] = ['portada', 'marquesina', 'presentacion']
type Drag = { id: string; mode: 'move' | 'resize'; handle?: string; startX: number; startY: number; original: EditorLayer }

function VisualEditor() {
  const [doc, setDoc] = useState<EditorDocument>(() => readSavedDocument())
  const [section, setSection] = useState<SectionKey>('presentacion')
  const [selectedId, setSelectedId] = useState('panel')
  const [snap, setSnap] = useState(true)
  const [guides, setGuides] = useState(true)
  const [aspectLocked, setAspectLocked] = useState(true)
  const [saved, setSaved] = useState(false)
  const [past, setPast] = useState<EditorDocument[]>([])
  const [future, setFuture] = useState<EditorDocument[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const selected = doc[section].find((layer) => layer.id === selectedId) ?? doc[section][0]
  const ordered = useMemo(() => [...doc[section]].sort((a,b) => b.z-a.z), [doc,section])

  const commit = useCallback((next: EditorDocument) => {
    setPast((items) => [...items.slice(-49), structuredClone(doc)])
    setFuture([])
    setDoc(next)
    setSaved(false)
  }, [doc])
  const patch = (id: string, values: Partial<EditorLayer>) => commit({...doc,[section]:doc[section].map(layer=>layer.id===id?{...layer,...values}:layer)})
  const undo = useCallback(() => { if (!past.length) return; setFuture(items=>[structuredClone(doc),...items]); setDoc(past[past.length-1]); setPast(items=>items.slice(0,-1)); setSaved(false) },[doc,past])
  const redo = useCallback(() => { if (!future.length) return; setPast(items=>[...items,structuredClone(doc)]); setDoc(future[0]); setFuture(items=>items.slice(1)); setSaved(false) },[doc,future])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase()==='z') { event.preventDefault(); event.shiftKey?redo():undo() }
      if (event.key==='Escape') setSelectedId('')
      if (selected && !selected.locked && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault(); const d=event.shiftKey?10:1; patch(selected.id,{x:selected.x+(event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0),y:selected.y+(event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0)})
      }
    }
    window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey)
  })
  const save = () => { localStorage.setItem(STORAGE_KEY,JSON.stringify(doc)); setSaved(true) }
  const discard = () => { setDoc(readSavedDocument()); setPast([]); setFuture([]); setSaved(true) }
  const resetAll = () => { commit(structuredClone(ORIGINAL_DOCUMENT)); setSection('presentacion'); setSelectedId('panel') }
  const resetLayer = () => { const original=ORIGINAL_DOCUMENT[section].find(x=>x.id===selected?.id); if(original) patch(original.id,{...original}) }
  const download = () => { const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='nano-portfolio-composicion.json'; link.click(); URL.revokeObjectURL(url) }

  const beginDrag = (event: React.PointerEvent, layer: EditorLayer, mode: Drag['mode'], handle?: string) => {
    if(layer.locked) return
    event.preventDefault(); event.stopPropagation(); setSelectedId(layer.id)
    dragRef.current={id:layer.id,mode,handle,startX:event.clientX,startY:event.clientY,original:{...layer}}
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    setPast(items=>[...items.slice(-49),structuredClone(doc)]); setFuture([]); setSaved(false)
  }
  const moveDrag = (event: React.PointerEvent) => {
    const drag=dragRef.current; const rect=canvasRef.current?.getBoundingClientRect(); if(!drag||!rect)return
    const dx=(event.clientX-drag.startX)*1920/rect.width, dy=(event.clientY-drag.startY)*sectionInfo[section].height/rect.height
    const layer=drag.original; const step=(v:number)=>snap?Math.round(v/10)*10:v
    let changes: Partial<EditorLayer>
    if(drag.mode==='move') changes={x:step(layer.x+dx),y:step(layer.y+dy)}
    else {
      const h=drag.handle??'se'; let w=layer.w+(h.includes('e')?dx:-dx), height=layer.h+(h.includes('s')?dy:-dy)
      if(aspectLocked){const ratio=layer.aspect;if(Math.abs(dx)>Math.abs(dy))height=w/ratio;else w=height*ratio}
      changes={w:Math.max(8,step(w)),h:Math.max(8,step(height)),...(h.includes('w')?{x:step(layer.x+layer.w-Math.max(8,w))}:{}),...(h.includes('n')?{y:step(layer.y+layer.h-Math.max(8,height))}:{})}
    }
    setDoc(current=>({...current,[section]:current[section].map(item=>item.id===drag.id?{...item,...changes}:item)}))
  }
  const endDrag=()=>{dragRef.current=null}
  const duplicate=()=>{if(!selected)return;const copy={...selected,id:`${selected.id}-${Date.now()}`,name:`${selected.name} copia`,x:selected.x+24,y:selected.y+24,z:selected.z+1,locked:false};commit({...doc,[section]:[...doc[section],copy]});setSelectedId(copy.id)}
  const remove=()=>{if(!selected||selected.locked)return;commit({...doc,[section]:doc[section].filter(x=>x.id!==selected.id)});setSelectedId('')}
  const changeSection=(key:SectionKey)=>{setSection(key);setSelectedId(doc[key][0]?.id??'')}
  const itemStyle=(layer:EditorLayer)=>({left:`${layer.x/1920*100}%`,top:`${layer.y/sectionInfo[section].height*100}%`,width:`${layer.w/1920*100}%`,height:`${layer.h/sectionInfo[section].height*100}%`,zIndex:layer.z,transform:`rotate(${layer.rotation}deg)`,display:layer.visible?'block':'none'})
  const startResize=(event:React.PointerEvent,handle:string)=>selected&&beginDrag(event,selected,'resize',handle)

  return <main className="ve-shell">
    <header className="ve-topbar"><div className="ve-brand"><span className="ve-brand-mark">N</span><div><strong>Visual Editor</strong><small>Nano Díaz® Portfolio</small></div></div>
      <div className="ve-top-actions"><button onClick={undo} disabled={!past.length}>↶ Deshacer</button><button onClick={redo} disabled={!future.length}>↷ Rehacer</button><span className="ve-divider"/><button onClick={discard}>Descartar</button><button className="ve-save" onClick={save}>{saved?'Guardado':'Guardar cambios'}</button></div>
    </header>
    <div className="ve-layout">
      <aside className="ve-left">
        <label className="ve-label" htmlFor="ve-section">Sección</label><select id="ve-section" value={section} onChange={e=>changeSection(e.target.value as SectionKey)}>{sectionOrder.map(k=><option key={k} value={k}>{sectionInfo[k].label}</option>)}</select>
        <div className="ve-list-head"><span>Capas · {doc[section].length}</span><button title="Duplicar capa" onClick={duplicate}>＋</button></div>
        <div className="ve-layer-list">{ordered.map(layer=><div key={layer.id} className={`ve-layer-row ${selectedId===layer.id?'is-selected':''}`}>
          <button className="ve-layer-select" onClick={()=>setSelectedId(layer.id)}><span className="ve-thumb">▧</span><span>{layer.name}</span></button>
          <button title={layer.locked?'Desbloquear':'Bloquear'} onClick={()=>patch(layer.id,{locked:!layer.locked})}>{layer.locked?'🔒':'♧'}</button><button title={layer.visible?'Ocultar':'Mostrar'} onClick={()=>patch(layer.id,{visible:!layer.visible})}>{layer.visible?'◉':'○'}</button>
        </div>)}</div>
        <button className="ve-reset-all" onClick={resetAll}>Restaurar composición original</button>
      </aside>
      <section className="ve-workspace">
        <div className="ve-tools"><span>{sectionInfo[section].label}</span><div><button className={snap?'active':''} onClick={()=>setSnap(!snap)}>▦ Ajustar a cuadrícula</button><button className={guides?'active':''} onClick={()=>setGuides(!guides)}>┼ Guías</button><button onClick={download}>Descargar configuración</button></div></div>
        <div className="ve-board-wrap"><div className={`ve-canvas-wrap ${section==='marquesina'?'is-marquee':''}`}><div className={`ve-canvas ${guides?'show-guides':''}`} ref={canvasRef} style={{aspectRatio:`1920 / ${sectionInfo[section].height}`,background:section==='presentacion'?'#004329':section==='marquesina'?'#fff234':'#0b0b0b'}}>
          {section==='presentacion'&&<img className="ve-canvas-bg" src="/assets/hoja3/fondo.png" alt="" draggable={false}/>}
          {doc[section].filter(layer=>layer.visible).map(layer=><img key={layer.id} src={layer.src} alt="" draggable={false} className={`ve-object ${selectedId===layer.id?'selected':''} ${layer.locked?'locked':''}`} style={itemStyle(layer)} onPointerDown={event=>beginDrag(event,layer,'move')} onPointerMove={moveDrag} onPointerUp={endDrag} />)}
          {selected&&selected.visible&&<div className="ve-selection" style={{left:`${selected.x/1920*100}%`,top:`${selected.y/sectionInfo[section].height*100}%`,width:`${selected.w/1920*100}%`,height:`${selected.h/sectionInfo[section].height*100}%`,zIndex:1002,transform:`rotate(${selected.rotation}deg)`}} onPointerMove={moveDrag} onPointerUp={endDrag}>
            {(['nw','n','ne','e','se','s','sw','w']).map(h=><button key={h} className={`ve-handle h-${h}`} onPointerDown={event=>startResize(event,h)} aria-label={`Redimensionar ${h}`}/>)}</div>}
          {guides&&<div className="ve-center-guide"/>}
        </div></div></div>
      </section>
      <aside className="ve-right"><div className="ve-panel-title">Propiedades</div>{selected?<>
        <div className="ve-selected-name"><span className="ve-thumb">▧</span><strong>{selected.name}</strong></div>
        <div className="ve-prop-grid">{([['X','x'],['Y','y'],['Ancho','w'],['Alto','h']] as const).map(([label,key])=><label key={key}>{label}<input type="number" value={Math.round(selected[key])} onChange={e=>patch(selected.id,{[key]:Number(e.target.value)})}/></label>)}</div>
        <label className="ve-range-label">Escala <span>{Math.round(selected.w/ORIGINAL_DOCUMENT[section].find(x=>x.id===selected.id)?.w!*100)}%</span></label><input className="ve-range" type="range" min="10" max="300" value={Math.min(300,Math.max(10,selected.w/(ORIGINAL_DOCUMENT[section].find(x=>x.id===selected.id)?.w??selected.w)*100))} onChange={e=>{const original=ORIGINAL_DOCUMENT[section].find(x=>x.id===selected.id);if(original){const w=original.w*Number(e.target.value)/100;patch(selected.id,{w,h:aspectLocked?w/selected.aspect:selected.h})}}}/>
        <label className="ve-check"><input type="checkbox" checked={aspectLocked} onChange={e=>setAspectLocked(e.target.checked)}/>Mantener proporción</label>
        <label className="ve-prop-line">Rotación <input type="number" value={selected.rotation} onChange={e=>patch(selected.id,{rotation:Number(e.target.value)})}/><span>°</span></label>
        <label className="ve-prop-line">Orden de capa <input type="number" value={selected.z} onChange={e=>patch(selected.id,{z:Number(e.target.value)})}/></label>
        <label className="ve-check"><input type="checkbox" checked={selected.visible} onChange={e=>patch(selected.id,{visible:e.target.checked})}/>Visible</label><label className="ve-check"><input type="checkbox" checked={selected.locked} onChange={e=>patch(selected.id,{locked:e.target.checked})}/>Bloqueado</label>
        <div className="ve-panel-actions"><button onClick={resetLayer}>Restablecer capa</button><button onClick={duplicate}>Duplicar</button><button className="ve-delete" onClick={remove} disabled={selected.locked}>Eliminar</button></div>
      </>:<p className="ve-hint">Seleccioná una capa en el lienzo o en la lista.</p>}
        <p className="ve-coordinate-note">Coordenadas en píxeles de referencia · 1920 × {sectionInfo[section].height}</p>
      </aside>
    </div>
  </main>
}
export default VisualEditor

