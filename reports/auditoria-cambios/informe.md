# Auditoría de cambios — Portfolio Nano Díaz®

**Fecha:** 4 de noviembre de 2026  
**Alcance:** revisión del estado actual contra el backup `PORTAFOLIO-LUCA - backup` (4/11 21:35), la implementación original de la fase 1 y la referencia `HOJA 3.jpg`.  
**Importante:** no se modificó código de la sección ni ningún recurso original. Solo se regeneró `dist` al ejecutar la validación.

---

## 1. Resumen ejecutivo

La base estática de la sección 3 sigue siendo fiel a la referencia: fondo, panel, texto, cámara, billetera, taza, teclado, marcadores y demás objetos mantienen posición y escala dentro de 1–2 px. Los 20 PNG están presentes y cargan correctamente.

Los cambios más importantes desde la fase 1 son:

1. **Se agregaron interacciones y etiquetas flotantes** en la sección 3 (hover, tooltips de aplicaciones y foco de teclado), a pesar de que la fase 1 pedía composición estática.
2. **Se agregaron efectos a la marquesina** (hover, filtro SVG de tinta y grano animado), aunque la consigna pedía no modificarla.
3. **Se sumó un editor visual** para las tres secciones y un flujo de publicación mediante `composition.json`.
4. **Se cambió el comportamiento responsive de la sección 3** para mostrar siempre el lienzo 16:9 completo, con barras negras laterales en relaciones de aspecto más anchas que 16:9.
5. **Se agregó SEO, favicon, imagen Open Graph y robots.txt**.
6. **Se aplicó una reducción del 30% a los iconos de aplicaciones** (`--app-rest: 0.7`), que produjo el único desvío visual claro contra la referencia.

**Resultado:** `typecheck` y `build` pasan. No hay errores de consola ni imágenes rotas. La sección se ve muy bien en 1920×1080, pero la fila de aplicaciones quedó más chica y desplazada respecto de `HOJA 3.jpg`. Además, el nuevo encuadre responsive deja barras negras en 2048×974.

---

## 2. Metodología

- El proyecto no tiene repositorio Git, así que la comparación se hizo contra:
  - el backup `C:\Users\AGUSTIN\Desktop\PORTAFOLIO-LUCA - backup` (snapshot de las 21:35);
  - los timestamps de los archivos;
  - las capturas de `reports/fase-1/`;
  - la referencia `C:\Users\AGUSTIN\Desktop\HOJA 3.jpg`.
- Se compararon los archivos con `git diff --no-index` y hashes SHA-256.
- Se renderizó la sección 3 a 1920×1080, 2048×974, 1366×768 y 390×844 con Chrome headless, usando un iframe de tamaño exacto.
- Se verificaron las 51 imágenes de la página (sin roturas), la consola y los pedidos de red.

---

## 3. Cambios posteriores al backup (21:35 → ahora)

### 3.1. `src/index.css` — encuadre de la sección 3

**Antes (backup):**
- El lienzo se agrandaba con `max(100vw, 100svh * 16 / 9)` y se centraba.
- En pantallas más anchas que 16:9, la composición llenaba el ancho y se recortaba arriba/abajo.
- En 2048×974 no había barras laterales, pero se perdían la regla superior/inferior.

**Ahora:**
- El lienzo mide exactamente `1920 * var(--s)` por `1080 * var(--s)`.
- La sección mide `1080 * var(--s)` de alto.
- La composición completa siempre entra; en 2048×974 aparecen **158 px negros a cada lado**.
- En 1920×1080 se ve 1:1 (captura sin barras de scroll).

**Efecto:** se ganó fidelidad y se evitó el recorte, pero se perdió el efecto full-bleed. En 2048×974 la franja amarilla de la sección 2 llega hasta los bordes y la sección 3 arranca 158 px más adentro, con negro a los costados.

### 3.2. `src/App.tsx` — editor solo en desarrollo

- El editor visual pasó a cargarse con `lazy()` y únicamente si `import.meta.env.DEV` es verdadero.
- En producción, `?editor=1` ya no abre el editor; muestra el portfolio normal.
- El bundle de producción ya no incluye el editor (verificado: 0 coincidencias de “Visual Editor”/“Restaurar composición” en el JS final).

### 3.3. `src/editor/model.ts` y `src/editor/composition.json`

- Se agregó `composition.json` como composición publicada.
- En producción, `readSavedDocument()` devuelve **solo** `PUBLISHED_DOCUMENT`; ya no lee `localStorage`.
- En desarrollo, `localStorage` se superpone sobre la composición publicada.
- `composition.json` contiene 32 capas: 7 de portada, 5 de marquesina y 20 de presentación.
- **Verificación:** `composition.json` coincide exactamente con `ORIGINAL_DOCUMENT` en todas las capas y propiedades. Es decir, todavía no hay ajustes publicados distintos de la base.

### 3.4. `index.html` y `public/`

- Nuevo title y meta description.
- Meta Open Graph y Twitter Card.
- `favicon.png` (512×512), `apple-touch-icon.png` (180×180), `og-image.png` (1200×630) y `robots.txt`.
- La imagen Open Graph y el favicon usan el logo NANO DS sobre fondo amarillo.
- `robots.txt` permite todo y deja un TODO para el sitemap.

### 3.5. `dist/`

- Se regeneró el build. Resultado actual:
  - JS: 233,01 kB (72,89 kB gzip)
  - CSS: 7,64 kB (2,46 kB gzip)
  - 23 módulos transformados
- Sin errores de compilación.

---

## 4. Cambios acumulados desde la fase 1 (antes del backup)

### 4.1. Sección 3 — interacciones y tooltips

En `src/components/Section3.tsx`:

- `grid`, `panel` e `intro` quedaron fijos (`STATIC_IDS`).
- El resto de las capas se envolvió en `.section-three__item`, con una imagen interna `.section-three__art` para que el hover no mueva el área sensible.
- Los cinco iconos de aplicaciones tienen:
  - reducción en reposo (`scale: 0.7`);
  - etiqueta flotante tipo macOS;
  - foco de teclado y `aria-label`;
  - hover con elevación, rotación e incremento de escala.
- **Todos** los objetos no estáticos (cámara, billetera, taza, teclado, marcadores, papel, etc.) tienen hover con desplazamiento, rotación y escala.

Esto convierte a la sección en interactiva, no en una composición estática. Si la fase 1 debía terminar sin animaciones, es el desvío de alcance más grande.

### 4.2. Marquesina

En `src/components/Marquee.tsx` y `src/index.css`:

- Las piezas se leen del documento del editor, con sincronización por `storage` entre pestañas.
- Hay hover con traslado, rotación y escala por pieza.
- Se agregó un filtro SVG `ink-settle` a texto y flechas.
- Se agregó un grano animado (`ink-drift`) con `mix-blend-mode: multiply` sobre toda la franja.
- Se mantiene la animación de desplazamiento de 43 s y el respeto por `prefers-reduced-motion`.

La marquesina ya no está intacta respecto del brief de la fase 1.

### 4.3. Editor visual

- `?editor=1` en desarrollo abre un editor de tres secciones.
- Permite seleccionar, arrastrar, redimensionar, rotar, cambiar orden Z, visibilidad y bloqueo.
- Incluye duplicar, eliminar, deshacer/rehacer, ajuste a cuadrícula, guías, guardado local y descarga de JSON.
- La composición base está en `src/editor/model.ts` y la publicada en `src/editor/composition.json`.

### 4.4. Portada

- `Hero.tsx` ahora toma posiciones y tamaños del documento del editor.
- El año 2026 se dibuja con cuatro círculos.
- No se detectaron cambios visuales respecto del backup en la portada.

---

## 5. Validación visual contra `HOJA 3.jpg`

### Lo que coincide

- Fondo, cuadrícula, reglas y numeración: alineados.
- Panel verde central: posición y tamaño correctos.
- Texto “Hola, soy Nano…”: posición, escala y recorte correctos.
- MP3, botón de play, auriculares, clips, credencial, cámara, billetera, taza, papel, teclado y marcadores: alineados dentro de 1–2 px.
- La captura de 1920×1080 se ve prácticamente igual a la referencia, salvo la fila de aplicaciones.

### Desvío principal: fila de aplicaciones

Medición sobre la captura de 1920×1080:

| Elemento | Referencia | Actual |
|---|---:|---:|
| Icono Photoshop, ancho visible | ≈ 97 px | ≈ 69 px |
| Icono Photoshop, alto visible | ≈ 102 px | ≈ 70 px |
| Borde izquierdo | ≈ x 75 | ≈ x 110 |
| Borde superior | ≈ y 917 | ≈ y 940 |

- Los iconos quedaron aproximadamente **30% más chicos**.
- La fila se corrió aproximadamente **35 px a la derecha** y **23 px hacia abajo**.
- Causa: `--app-rest: 0.7` escala la caja completa desde su centro. La caja original (`x=74`, `y=913`, `239×165`) sí coincide con la referencia; al reducirla desde el centro, el contenido visible se desplaza hacia adentro.
- La referencia sugiere que los iconos deben quedar a escala **1.0** (sin reducción en reposo). Si se quiere un margen para el hover, conviene usar `transform-origin: left top` y un valor cercano a `0.95–1`, no `0.7`.

### Responsive

- **1920×1080:** composición completa 1:1 (captura con scrollbars ocultas).
- **2048×974:** composición completa, con 158 px negros a cada lado.
- **1366×768:** composición completa; en un navegador con scrollbar clásica se recortan ≈ 8 px de cada lado.
- **390×844:** la composición conserva 16:9 y se ve completa, pero mide solo ≈ 219 px de alto; el resto de la página queda negro. Es coherente con “priorizar escritorio”, pero la lectura móvil es muy pequeña.

### Detalle de scrollbar

`--s` usa `100vw`, que incluye el ancho de la scrollbar, mientras que `.section-three` mide `100%` del viewport útil. En 1920×1080 con scrollbar clásica de Windows:

- viewport útil ≈ 1903 px;
- lienzo = 1920 px;
- recorte ≈ 8,5 px por lado.

Afecta sobre todo a los números extremos de la regla (0 y 42). No se ve en la captura porque se ocultó la scrollbar para el render exacto.

---

## 6. Hallazgos técnicos

### 6.1. El merge del editor no publica capas nuevas ni eliminadas

`merge(base, saved)` recorre siempre `ORIGINAL_DOCUMENT` y busca la capa guardada por id. Consecuencias:

- Si en el editor **duplicás** una capa, la copia se descarta al leer la composición publicada.
- Si **eliminás** una capa, se vuelve a agregar desde el original.
- Solo se publican cambios de propiedades de capas existentes (x, y, w, h, z, rotación, visibilidad, src).

La UI del editor ofrece duplicar y eliminar, pero el flujo de publicación no las conserva. Es el punto más importante a corregir si se va a usar el editor para producir la versión final.

### 6.2. La sección 3 no escucha cambios del editor en vivo

- `Marquee` tiene un listener de `storage`.
- `Section3` lee la composición una sola vez con `useState`.
- `Hero` también lee al renderizar, sin listener.

En desarrollo, si guardás desde otra pestaña, la marquesina se actualiza pero la sección 3 no hasta recargar. Es una inconsistencia menor.

### 6.3. Accesibilidad del texto principal

El texto “Hola, soy Nano…” es una imagen con `alt=""` y `aria-hidden="true"`. El `<section>` solo tiene `aria-label="Presentación de Nano Díaz"`. Un lector de pantalla no accede al mensaje principal.

Recomendación: agregar un `<h2 class="sr-only">` con el texto completo, o un `alt` real en la imagen de presentación. El archivo `.sr-only` ya existe en el CSS.

### 6.4. Foco de teclado en iconos decorativos

Los cinco iconos de aplicaciones tienen `tabIndex={0}` y `role="img"`, pero no ejecutan ninguna acción. Generan cinco paradas de tabulación sin destino. Si no van a ser enlaces/botones, conviene quitar el `tabIndex` o convertirlos en elementos accionables.

### 6.5. `object-fit: fill` y proporción editable

Las capas usan `object-fit: fill` con ancho y alto explícitos. Hoy todas las proporciones coinciden con los PNG, así que no hay deformación. Si en el editor se desbloquea la proporción y se cambia el ancho/alto, la imagen se deformará. Para el flujo de publicación conviene forzar proporción o usar `object-fit: contain` con una caja recortada.

### 6.6. Caso especial del texto de audio

`model.ts` revierte automáticamente la capa `audio` si aparece en `x=231, y=-78`. Es un parche muy específico; si alguna vez se quiere mover el texto a esa posición, el editor lo va a revertir. Conviene eliminar ese caso cuando ya no sea necesario.

### 6.7. Documentación desactualizada

`reports/fase-1/informe.md`:

- dice que no se agregaron animaciones a la sección 3, pero ahora hay hover y tooltips;
- tiene un `\n\n` literal en la sección “Ajustes posteriores”, por lo que los bullets no se renderizan;
- las capturas de 2048×974 corresponden al comportamiento anterior (full-bleed), no al actual (letterbox).

### 6.8. Menores

- `og:image` y `twitter:image` usan ruta relativa; algunos clientes sociales necesitan URL absoluta.
- `robots.txt` todavía no declara sitemap.
- El tooltip usa `font-weight: 500`, pero la carga de Google Fonts solo incluye Inter 300 y 400.
- El editor solo existe en desarrollo; si se esperaba editar el sitio publicado con `?editor=1`, ya no va a funcionar.

---

## 7. Recomendaciones priorizadas

1. **Corregir la fila de aplicaciones:** llevar `--app-rest` a `1` (la referencia coincide con la caja original) o, si se quiere reducir, usar `transform-origin: left top` y recalcular la posición del tooltip.
2. **Decidir el criterio responsive:** el letterbox actual es fiel y no recorta, pero deja barras negras. Si se quiere evitar el corte visual, rellenar los laterales con el verde del fondo o extender solo el fondo/cuadrícula, sin mover los objetos.
3. **Reemplazar `100vw` en el cálculo de la sección** por el ancho real del contenedor para eliminar el recorte de 8 px con scrollbar clásica.
4. **Corregir el merge del editor** para que las capas duplicadas/eliminadas se publiquen; o deshabilitar duplicar/eliminar hasta resolverlo.
5. **Agregar el texto principal en `sr-only`** para accesibilidad y SEO.
6. **Actualizar el informe de fase 1** y sacar el `\n` literal.
7. Si la marquesina debía quedar intacta, **revisar los efectos agregados** (hover, filtro de tinta y grano).

---

## 8. Validación ejecutada

| Prueba | Resultado |
|---|---|
| `npm run typecheck` | Correcto |
| `npm run build` | Correcto (Vite 8.3.5) |
| Errores de consola | 0 |
| Imágenes rotas | 0 |
| Imágenes totales cargadas | 51 |
| Pedidos `/assets/` fallidos | 0 |
| Editor en bundle de producción | Excluido |
| `composition.json` vs `ORIGINAL_DOCUMENT` | Idénticos |

---

## 9. Capturas

- `actual-1920x1080.png` — sección 3 a tamaño de referencia, sin scrollbars.
- `actual-2048x974.png` — comportamiento letterbox actual.
- `actual-1366x768.png` — 16:9 en notebook.
- `actual-390x844.png` — vista móvil completa (portada + marquesina + sección 3).
- `comparativa-apps.png` — referencia (izquierda) vs implementación actual (derecha), recorte de la fila de aplicaciones.
