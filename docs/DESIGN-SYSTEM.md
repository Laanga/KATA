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
