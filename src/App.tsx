import { lazy, Suspense } from 'react'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Section3 from './components/Section3'

// El editor visual existe solo en desarrollo: en el build de producción ni siquiera se incluye.
const VisualEditor = import.meta.env.DEV ? lazy(() => import('./editor/VisualEditor')) : null

function App() {
  if (VisualEditor && new URLSearchParams(window.location.search).get('editor') === '1') {
    return (
      <Suspense fallback={null}>
        <VisualEditor />
      </Suspense>
    )
  }
  return (
    <>
      <Hero />
      <Marquee />
      <Section3 />
    </>
  )
}

export default App
