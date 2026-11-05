# FASE 1 — Sección 3: reconstrucción estática

## Referencia y recursos

La referencia `Desktop/HOJA 3.jpg` mide **1920 × 1080 px**. La carpeta `HOJA 3` contiene 20 PNG independientes; todos se leyeron con formato RGBA/32 bits y se conservaron intactos. Las imágenes se copiaron a `public/assets/hoja3/` para servirlas en la web. Se agregó `presentacion.png` como copia con nombre estable del recurso de texto cuyo nombre original es largo; el original permanece sin cambios.

| Recurso | Dimensiones |
|---|---:|
| ¿Listos para escuchar algo de musiquita_.png | 100 × 62 |
| After Effect.png | 242 × 165 |
| BILLETERA EN FORMA DE FOLDER.png | 348 × 300 |
| bolita de papel.png | 80 × 220 |
| Camara vintage.png | 332 × 495 |
| Clips.png | 276 × 146 |
| fondo.png | 1919 × 1080 |
| HELLO MY NAME IS.png | 488 × 311 |
| Hola, soy Nano… exploro f.png | 1217 × 256 |
| Ilustrautor.png | 233 × 163 |
| Letra ESQ.png | 226 × 213 |
| Microfibras.png | 460 × 335 |
| Mp3.png | 619 × 445 |
| PHOTOSHOP.png | 239 × 165 |
| Premier.png | 239 × 170 |
| PROCREATE.png | 231 × 163 |
| rectangulo donde va el texto_.png | 1447 × 347 |
| signo play mp3.png | 23 × 22 |
| taza de cafe.png | 240 × 503 |
| Teclado.png | 684 × 419 |

## Implementación

- La composición se incorporó después de la marquesina; no se cambiaron los componentes de portada ni de la sección 2.
- Fondo, panel, texto y objetos se renderizan como capas `<img>` independientes con coordenadas, tamaño y `z-index` explícitos en el lienzo de referencia 1920 × 1080. La lista de capas queda en `src/components/Section3.tsx` para futuros ajustes y animación.
- No se agregaron animaciones a la sección 3.
- El lienzo de objetos conserva 16:9 y se ajusta al alto disponible para mostrar la composición completa; el fondo se extiende detrás para ocupar el ancho restante. Los objetos pueden sobresalir del lienzo sin quedar recortados.

## Ajustes posteriores a la revisión visual\n\n- Se redujo el `z-index` del papel arrugado y se desplazó ligeramente hacia el interior.\n- Se amplió el lienzo para cubrir los viewports anchos y eliminar las franjas laterales.\n- Se desplazó la taza hacia la derecha para dejar visible el café.\n- La fila de logos se movió hacia abajo y a la derecha; el ajuste de escala conserva los logos completos en pantallas bajas.\n\n## Validación

- `npm run typecheck` — correcto.
- `npm run build` — correcto (Vite 8.3.5).
- Capturas revisadas a 1920 × 1080 y 2048 × 974; las 20 imágenes de la composición cargaron correctamente.

### Capturas

- `seccion-3-1920x1080.png`
- `seccion-3-2048x974.png`


