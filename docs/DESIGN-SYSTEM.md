# Sistema de diseño de Kata

La fuente de verdad visual es `src/styles/design-system.css`. Los componentes de `src/components/ui` aportan la semántica y el comportamiento. El catálogo interactivo está en `/design-system` (requiere sesión); utiliza los mismos componentes que la aplicación y no aparece en la navegación del producto.

## Identidad y jerarquía

Se conserva la tipografía Noto Sans JP, el fondo oscuro y el cristal translúcido. El esmeralda identifica la acción principal y las selecciones. Los colores de categorías se reservan para metadatos e iconos; no redefinen los botones.

| Elemento | Regla |
| --- | --- |
| Botones, campos y opciones | Radio de 12 px |
| Tarjetas | Radio de 20 px |
| Diálogos | Radio de 24 px; adaptación inferior en móvil |
| Navegación y filtros | Píldoras |
| Altura de controles | 36/44/48 px; mínimo táctil de 44 px en móvil |
| Espaciado | Escala de 4, 8, 12, 16, 24 y 32 px |
| Títulos | `kata-title-page`, `kata-title-section`, `kata-title-dialog` |
| Texto y etiquetas | `kata-copy`, `kata-label` |

La portada puede utilizar una composición y tipografía de campaña más grandes; sus acciones conservan el mismo componente y variantes.

## Componentes

- `Button`: acción principal, secundaria, contorno, discreta, peligrosa o de advertencia. Usar una principal por grupo de acciones. El tipo predeterminado es `button`: los formularios deben declarar `type="submit"`. `isLoading` bloquea acciones y comunica el estado ocupado.
- `ButtonLink`: navegación con aspecto de botón y semántica de enlace. `IconButton` exige una etiqueta accesible.
- `TextInput`, `TextArea`, `NativeSelect`: campos nativos. Asociar siempre una etiqueta; para errores usar `aria-invalid` y `aria-describedby`.
- `Chip`: filtro con `selected` y estado accesible `aria-pressed`.
- `RadioChoice`: elección exclusiva nativa, con nombre compartido y navegación de teclado.
- `Panel`: superficie normal, discreta (`subtle`) o de énfasis (`accent`).
- `Modal`: diálogo compartido con cierre, foco y adaptación móvil. `kata-action-row` organiza las acciones, también en móvil.

## Mantener la coherencia

Usar `className` para distribución y anchura; evitar redefinir fondos, radios, sombras o tamaños de texto de los controles. Si hace falta una variante nueva, incorporarla al componente y al catálogo. Los círculos de avatares, portadas y gráficos no son controles y mantienen su geometría propia.

El foco visible, los estados deshabilitado/error/carga y la preferencia de movimiento reducido están centralizados. El onboarding usa los mismos componentes: no tiene una familia visual independiente.

## Alcance y continuidad

Por indicación expresa del usuario, esta es la base obligatoria de toda Kata y de las funcionalidades futuras. La uniformidad se mantiene reutilizando los mismos componentes, no copiando su aspecto en cada pantalla. Las instrucciones de `AGENTS.md` recogen este requisito para futuras intervenciones.

La revisión integral incluye portada, acceso/registro/recuperación/verificación, inicio, biblioteca en cuadrícula/lista, colecciones, búsqueda, descubrimiento, perfil, Ajustes, onboarding, edición/guardado, confirmaciones y 404. Las tarjetas, skeletons, mensajes y navegación comparten tokens; los controles de las pantallas se importan de `ui`.

La regla de ESLint `no-restricted-syntax` impide añadir botones, inputs, selectores y áreas de texto nativos fuera de `src/components/ui`. No detecta por sí sola todas las divergencias visuales: la revisión de distribución y estados en móvil/escritorio sigue siendo necesaria.

### Componentes y patrones adicionales

- `ActionButton`: acción de fila con explicación, para Ajustes y listas.
- `MediaButton` / `kata-media-surface`: tarjetas de portadas con superficie y foco compartidos.
- `ColorSwatch`: muestra de color seleccionable, 44 px y nombre accesible; el color de la colección se muestra como dato, mientras la selección usa esmeralda.
- `Checkbox`, `FilePicker`, `FileInput`: controles nativos encapsulados; el selector de archivos conserva acceso por teclado.
- `kata-nav-link`: navegación con estado de página actual y foco; `Chip` se usa para filtros y pestañas de contenido.
- `kata-popover`, `kata-icon-well`, `kata-notice`: menús, iconos y mensajes de información, advertencia o error. Las notificaciones flotantes usan los mismos tokens.

La paleta por categoría, los gráficos, los avatares, las insignias y las ilustraciones de portada conservan su significado visual. No son familias alternativas de botones o formularios.

La valoración usa `StarRating`: cinco estrellas pulsables, puntuaciones enteras de 0 a 5 y una acción independiente para quitar la puntuación. No sustituirlo por un desplegable ni añadir medias estrellas.
