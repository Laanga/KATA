<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Identidad visual obligatoria de Kata

El usuario ha establecido el sistema de diseño actual como base para toda la web y para cualquier cambio futuro. Antes de modificar una interfaz, leer `docs/DESIGN-SYSTEM.md`. La referencia visual es el catálogo `/design-system`; los tokens están en `src/styles/design-system.css` y los componentes compartidos en `src/components/ui`.

- Mantener Noto Sans JP, el fondo oscuro, las superficies translúcidas y el esmeralda. No introducir una identidad alternativa para una página, modal u onboarding.
- Reutilizar Button, ButtonLink, IconButton, TextInput, TextArea, NativeSelect, Chip, RadioChoice, Panel y Modal según su función. No crear controles equivalentes con estilos independientes.
- Usar className de los controles para distribución y anchura, sin redefinir localmente colores, radios, sombras o tipografía. Si falta una variante, añadirla al componente compartido y al catálogo.
- Respetar la jerarquía documentada: controles de 12 px, tarjetas de 20 px, diálogos de 24 px y píldoras para navegación/filtros. Avatares, portadas, gráficos y composición de portada pueden conservar su geometría semántica.
- Al tocar una pantalla heredada, corregir las divergencias visuales relacionadas con el cambio mediante estos componentes. Mantener etiquetas, teclado, foco, estados de carga/error y adaptación móvil.
- Comprobar la coherencia en escritorio y móvil. No afirmar que el 100 % de las pantallas está migrado sin haberlo verificado: la regla de lint de controles no sustituye una revisión visual de las pantallas.
