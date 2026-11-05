# Visual Editor — implementación

Acceso local: `http://localhost:5173/?editor=1`

## Incluye
- Edición separada del modo normal; quitar `?editor=1` vuelve al portfolio.
- Tres secciones: portada, marquesina y presentación.
- Selección desde el lienzo o la lista de capas; arrastre con coordenadas de referencia.
- Redimensionamiento con ocho puntos, proporción bloqueable, posición, tamaño, escala, rotación y orden Z.
- Visibilidad, bloqueo, duplicación, eliminación de la capa y restauración individual o completa.
- Cuadrícula, guía central, Ctrl+Z, Ctrl+Shift+Z, guardado y descarte de cambios.
- Guardado local en el navegador y descarga de `nano-portfolio-composicion.json`.
- Las composiciones guardadas para portada, marquesina y presentación se usan en la vista normal de ese mismo navegador.

Los PNG originales no se modifican. La configuración base está en `src/editor/model.ts` y el editor en `src/editor/VisualEditor.tsx`.

## Validación
- `npm run typecheck`: correcto.
- `npm run build`: correcto.
- La revisión manual de interacción con mouse queda pendiente; la captura automatizada del navegador no se pudo completar en esta sesión.
