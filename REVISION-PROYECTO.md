# Revisión de Kata y propuesta de onboarding

Fecha: 10 de septiembre de 2026.

> Documento de la revisión inicial. Sus resultados y referencias de línea describen el estado anterior a los cambios. Consulta [IMPLEMENTACION.md](docs/IMPLEMENTACION.md) para el estado actual y las pruebas realizadas.

Revisión del repositorio local: autenticación, biblioteca, búsqueda, descubrimiento, perfil, colecciones, persistencia, esquema SQL, componentes compartidos, configuración y herramientas de calidad. No se ha modificado el funcionamiento de la aplicación.

La prioridad es hacer fiable el ciclo «buscar → guardar → volver y encontrarlo». El onboarding tiene sentido, pero depende de que ese ciclo funcione y comunique correctamente los errores.

## Alcance y comprobaciones

| Comprobación | Resultado |
| --- | --- |
| Instalación reproducible | `npm ci --ignore-scripts --no-audit --no-fund` completado con el lockfile existente. |
| TypeScript | `npx tsc --noEmit` pasa. |
| Lint | 48 errores y 17 avisos. Los errores son usos de `any`; también hay avisos de dependencias de efectos e imports sin uso. |
| Build | Compila JavaScript y supera TypeScript, pero falla al prerenderizar `/reset-password` porque faltan las variables de Supabase. No demuestra un fallo del despliegue configurado. |
| Tests | `npm test` no puede ejecutarse: Bun no está instalado. No se encontraron archivos de pruebas versionados. |
| Comprobaciones aisladas | El conversor de actualizaciones no envía ningún cambio al borrar una reseña; el parser CSV elimina las comillas literales de un campo exportado. Ambos reproducidos ejecutando las funciones locales. |

No hay credenciales locales para comprobar Supabase ni sus políticas realmente desplegadas. No se ha hecho una prueba visual en navegador, una auditoría de dependencias ni una medición de rendimiento. Las conclusiones visuales se limitan al comportamiento definido en el código; los riesgos que requieren despliegue se indican como pendientes de verificación.

## Fallos prioritarios

### 1. Importar y vaciar la biblioteca no persiste — alta

[SettingsModal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/SettingsModal.tsx:483) llama a `setItems(importedItems)` y `setItems([])`. [store.ts](/home/langa/Documentos/personalprojects/KATA/src/lib/store.ts:112) solo cambia memoria: no escribe en Supabase.

Consecuencia: la importación desaparece al recargar y los elementos «eliminados» vuelven. Los elementos importados pueden tener IDs que no existen en la base de datos, por lo que editarlos después también puede fallar.

Mejora: operaciones explícitas de importación y vaciado en la capa de persistencia; decidir y mostrar si se fusiona o reemplaza; previsualizar duplicados y errores, preservar relaciones con colecciones y actualizar el estado después de confirmar la operación. No basta con sustituir el array de Zustand.

### 2. Se anuncia éxito antes de guardar o eliminar — alta

[AddItemModal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/media/AddItemModal.tsx:118), [EditItemModal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/media/EditItemModal.tsx:79) y [KataCard.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/media/KataCard.tsx:119) no esperan las promesas de persistencia antes de anunciar éxito. Al añadir y editar, el modal se cierra; al borrar, la tarjeta se oculta con una animación.

Consecuencia: un error de red, sesión o base de datos parece una operación completada. El usuario puede perder el texto del formulario o creer que ha guardado su primer título cuando no se ha guardado.

Mejora: `await`, manejo de errores, estado de guardado por operación y botón deshabilitado mientras se envía. Mantener el formulario al fallar. En Descubrir ya existe un patrón con `await` que puede servir de referencia.

### 3. Un error de carga se convierte en una biblioteca vacía — alta

En [store.ts](/home/langa/Documentos/personalprojects/KATA/src/lib/store.ts:92), el `catch` borra los arrays y establece `isInitialized: true`. La siguiente llamada a `initialize()` retorna inmediatamente. Además, la carga agrupa items, colecciones y sus relaciones: el fallo de una consulta de colecciones puede ocultar todos los items.

Mejora: separar carga, error y ausencia real de datos; conservar los datos válidos; permitir reintentar. Evitar inicializaciones simultáneas y no utilizar un único `isLoading` para todas las mutaciones. El timeout de Home se activa cuando NO está cargando, por lo que tampoco cubre una petición que permanece pendiente.

### 4. El reenvío del correo queda inutilizable en el alta con confirmación — alta

[AuthForm.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/auth/AuthForm.tsx) contempla `user` sin `session` y redirige a `/verify-email`. Esa página obtiene el email únicamente con `auth.getUser()`: sin sesión, no puede recuperarlo y deshabilita «Reenviar Email».

Mejora: conservar temporalmente el email introducido para ese flujo y permitir introducirlo o corregirlo en la pantalla de verificación. Ese email sirve para el reenvío, nunca como prueba de identidad.

### 5. Una cuenta sin username puede entrar en pantallas que no cargan — media

El [middleware](/home/langa/Documentos/personalprojects/KATA/src/middleware.ts) comprueba si hay usuario, pero no si terminó de elegir su nombre. [StoreInitializer.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/StoreInitializer.tsx:29) sí exige username para cargar. El callback redirige correctamente en su flujo, pero el usuario puede acceder directamente a `/library` o volver después de abandonar ese paso.

Consecuencia: es posible quedarse viendo un skeleton. La política de acceso y la condición de inicialización deben coincidir. Centralizar la decisión de destino y usarla también para el onboarding.

### 6. La búsqueda puede mostrar resultados de una consulta anterior — media

En [search/page.tsx](/home/langa/Documentos/personalprojects/KATA/src/app/search/page.tsx:204), las búsquedas solapadas publican resultados sin comprobar si siguen siendo la consulta vigente. Los AbortController internos solo implementan timeout; no cancelan la búsqueda anterior al escribir otra.

Reproducción propuesta: buscar A, buscar B antes de que A termine y hacer que A responda más tarde. Los resultados de A pueden sustituir los de B. También pueden reaparecer después de vaciar el campo. Los errores se convierten en arrays vacíos y pueden guardarse en caché; repetir la misma consulta queda bloqueado por `lastQueryRef`.

Mejora: cancelación compartida o identificador de petición vigente, errores por proveedor, reintento explícito y caché solo de respuestas válidas. El filtro de categoría debería permitir evitar consultas innecesarias a los cuatro proveedores.

### 7. Borrar una reseña no borra la reseña guardada — media

[EditItemModal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/media/EditItemModal.tsx:82) convierte el texto vacío en `undefined`. [supabase.ts](/home/langa/Documentos/personalprojects/KATA/src/types/supabase.ts:185) interpreta `undefined` como «no actualizar».

Comprobación aislada: el valor enviado al conversor cuando se borra la reseña genera `{}`, por lo que la reseña anterior permanece. Enviar una cadena vacía para que el conversor la transforme en `null`, o definir explícitamente `null` como borrado en el contrato.

### 8. Se identifica una obra por su título — media

El [índice único SQL](/home/langa/Documentos/personalprojects/KATA/supabase-schema.sql:50) usa usuario, tipo y título normalizado. La búsqueda recibe `externalId`, pero este no se conserva en `MediaItem` ni al insertar. Dos películas distintas con el mismo título quedan bloqueadas como duplicadas; una misma obra con otro título puede duplicarse.

Además, [Descubrir](/home/langa/Documentos/personalprojects/KATA/src/app/discover/page.tsx:223) compara solo el título, sin tipo: tener un libro puede ocultar una película homónima.

Mejora: conservar proveedor e identificador externo y definir la unicidad por usuario/proveedor/ID. Migrar con cuidado los registros existentes; un fallback por título requiere revisión de ambigüedades.

### 9. Las portadas de reserva son inconsistentes — media

Añadir usa `https://via.placeholder.com/300x450?text=No+Cover`, un dominio que no está en `images.remotePatterns`; las tarjetas lo pasan a `next/image`. Descubrir usa `/placeholder-cover.jpg`, que no existe en `public`.

Mejora: un único componente de portada con un fallback local real y manejo de error. Debe aceptar portadas ausentes y URLs importadas sin romper el modal o la tarjeta.

### 10. El CSV no permite recuperar fielmente la exportación — media

En [SettingsModal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/SettingsModal.tsx:287), el parser elimina todas las comillas de la línea y después intenta desescapar unas comillas que ya no existen. Divide por saltos de línea antes de procesar campos entrecomillados, por lo que una reseña multilínea rompe los registros.

Comprobación aislada: `"Una ""cita""",MOVIE` se lee como `Una cita`, perdiendo las comillas de la reseña/título. El CSV tampoco exporta portadas y la importación JSON convierte una valoración numérica 0 en `null`.

Mejora: parser CSV que respete campos multilínea y comillas escapadas, contrato de exportación versionado y prueba exportar→importar. Para una copia completa, incluir colecciones y relaciones, actualmente ausentes de la exportación JSON.

## Experiencia de uso y modelo de producto

### Primera sesión

[Home](/home/langa/Documentos/personalprojects/KATA/src/app/home/page.tsx:236) saluda con «Bienvenido de vuelta» incluso a una cuenta nueva. «Buscar Contenido» lleva a `/library`, cuyo estado vacío vuelve a enviar al buscador. Corregir ese destino a `/search` elimina un paso inmediatamente.

En Biblioteca distinguir: biblioteca realmente vacía, colección sin elementos, filtros sin coincidencias y fallo al cargar. Cada estado necesita una acción distinta: añadir, organizar, limpiar filtros o reintentar.

### Accesibilidad y móvil

- [Modal.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/ui/Modal.tsx) declara diálogo, pero no gestiona foco inicial, confinamiento del foco, devolución del foco, Escape ni nombre accesible enlazado al título.
- [RatingInput.tsx](/home/langa/Documentos/personalprojects/KATA/src/components/media/RatingInput.tsx:49) usa `div` con click sin interacción de teclado. Solo permite elegir enteros de 1 a 5: no se puede poner 0, media estrella ni volver a «sin puntuar».
- La navegación móvil tiene `z-[9999]` y el modal `z-50`: la navegación puede quedar por encima del diálogo y permitir salir durante una edición. Unificar las capas y comprobar el teclado virtual.
- La información y acciones de las tarjetas dependen en parte del hover. Verificar acceso táctil y por foco; mantener la acción principal disponible sin hover.
- Falta una estrategia global de movimiento reducido. Ofrecer animaciones breves y respetar la preferencia del usuario también en GSAP y Lenis.

### Descubrimiento y recomendaciones

- La caché `recommendations_${type}` en localStorage no incluye usuario ni preferencias. Dos cuentas en el mismo navegador pueden recibir las mismas recomendaciones cacheadas; cambiar valoraciones tampoco las invalida ese día. No implica que se esté mostrando la biblioteca ajena, pero sí una personalización incorrecta.
- El selector 7/30/90 días no significa lo mismo para libros: [upcoming/books](/home/langa/Documentos/personalprojects/KATA/src/app/api/upcoming/books/route.ts:19) lo traduce al año actual o a los últimos uno/dos años. Mostrar filtros adecuados para libros y explicar que son novedades recientes.
- Los géneros de series reutilizan el mapa de películas en el cliente de Descubrir. Mantener mapas propios por proveedor/tipo para no descartar géneros de TV ni enviar IDs incorrectos.
- Añadir desde Descubrir conserva título, portada y géneros, pero omite año, autor y plataforma disponibles en los resultados. Normalizar los resultados una vez y reutilizar el mismo contrato para búsqueda y descubrimiento.
- El arranque de recomendaciones requiere géneros en la biblioteca. El primer título guardado es una señal útil para iniciar la personalización sin pedir un cuestionario extenso.

### Estadísticas y progreso

El modelo actual sigue estados, pero no páginas leídas, capítulos vistos ni horas jugadas. Como evolución de producto, priorizar una sección «Continuar» con cambios de estado rápidos antes de añadir más gráficos. El seguimiento numérico requeriría nuevos campos y reglas por tipo.

El historial de actividad actual se basa principalmente en altas. `getMonthlyStats` utiliza `updatedAt` como fecha de finalización: editar después una nota mueve artificialmente el mes de finalización. Para métricas históricas fiables, añadir `completedAt` o eventos de actividad; no se puede reconstruir el historial perdido solo a partir del estado actual.

En Perfil, `items.sort(...)` modifica directamente el array del store. Usar una copia. Los días sin actividad muestran barras aleatorias: conviene representarlos como cero si el gráfico pretende mostrar actividad real.

## Arquitectura, seguridad y mantenimiento

| Área | Observación y mejora |
| --- | --- |
| RLS | El SQL incluye políticas por propietario para items y colecciones y comprueba ambos propietarios al insertar relaciones. Es una base útil; falta verificar su aplicación real con dos cuentas en un entorno de prueba. |
| Endpoints externos | Las rutas API están excluidas del middleware y no validan usuario dentro del handler. Pueden consumir cuotas sin iniciar sesión. Decidir explícitamente qué rutas son públicas, autenticar las privadas y establecer límites compartidos por usuario/IP en despliegues con varias instancias. El limitador actual está solo en memoria. |
| Caché PWA | Se extienden las reglas por defecto del plugin. La versión instalada incluye un fallback `NetworkFirst` para peticiones cross-origin. Excluir explícitamente autenticación y datos privados de Supabase; comprobar el service worker en producción, offline y al cambiar de cuenta. No se ha reproducido una exposición de datos. |
| Sesión | AuthProvider registra un listener vacío y el store no está ligado a un user ID ni tiene reset de sesión. El logout explícito recarga la página, pero los cambios de sesión en otra pestaña no tienen sincronización propia. Centralizar usuario, limpieza e inicialización. |
| Consultas | `getAll()` carga todos los items sin paginación; la inicialización hace una consulta adicional por colección. Paginar y cargar relaciones en bloque. Las estadísticas deben contemplar toda la biblioteca, no solo una página. |
| Colecciones | Borrar un item no limpia sus IDs de `collectionItemIds`. Los contadores actuales filtran por los items existentes y no muestran necesariamente un error, pero el estado conserva relaciones obsoletas hasta recargar. Limpiar ambos estados tras la eliminación. |
| Tipos | Los tipos manuales de Supabase necesitan varios `@ts-expect-error`; hay abundantes `any` en descubrimiento. Generar tipos desde el esquema y normalizar/validar las respuestas externas en la frontera del servidor. |
| Separación | SettingsModal mezcla cuenta, avatar, exportación e importación; Discover mezcla mapas, caché, peticiones, normalización y presentación. Extraer responsabilidades al corregir estos flujos, con pruebas de comportamiento. |
| Animaciones | Lenis no cancela el bucle `requestAnimationFrame` en cleanup. KataCard intenta eliminar un listener con una función anónima distinta a la registrada. Corregir la limpieza y medir antes de decidir qué bibliotecas retirar. |
| Tests y migraciones | `.gitignore` excluye `*.test.ts`, `*.test.js` y `migracion-*.sql`, facilitando que pruebas y cambios de esquema no se versionen. Crear una ruta clara de migraciones y checks de lint/tipos/pruebas en CI. |
| Documentación | README promete escala 0–10 con medios puntos, pero formularios y SQL usan 0–5 y el selector solo admite enteros. Hay dos lockfiles, una URL de clonación de ejemplo y documentación incompleta para reproducir storage/políticas de avatares. Unificar el gestor y documentar el entorno real. |

## Propuesta concreta de onboarding

Objetivo: que una persona termine con su primer título guardado y entienda cómo continuar. Propuesta de tres pasos breves, con «Ahora no» visible. Mantener la identidad visual existente y permitir completar todo con teclado y móvil.

### Paso 1 — «Tu biblioteca empieza contigo»

Texto: «Guarda lo que quieres ver, leer o jugar y lleva el seguimiento en un solo lugar».

Elegir una categoría inicial: películas, series, libros o juegos. Una sola elección sirve para orientar la búsqueda; no impide añadir otras categorías después. En esta primera versión no pedir avatar, biografía, muchos géneros ni repetir el username del registro.

### Paso 2 — «Añade tu primer título»

Mostrar el buscador con la categoría elegida y resultados reales. Seleccionar una obra y elegir «Pendiente», «En progreso» o «Completado» con el texto adaptado al tipo. Valoración y reseña opcionales, recogidas sin bloquear el primer guardado.

Confirmar «Guardado en tu biblioteca» solo cuando Supabase responda correctamente. Si falla un proveedor, permitir reintentar o cambiar de categoría. No completar el onboarding por haber pulsado el botón.

### Paso 3 — «Ya tienes tu primer título»

Mostrar el título guardado y una explicación breve: «En Biblioteca puedes cambiar su estado y organizarlo en colecciones».

Acción principal «Ir a mi biblioteca», secundaria «Añadir otro». Colecciones y funciones avanzadas se explican cuando se usan por primera vez. La Biblioteca debe abrir mostrando el elemento recién creado, sin filtros heredados que lo oculten.

### Cuándo aparece y cómo se guarda

- Después de tener sesión válida, correo confirmado y username, tanto para email como para Google. La recuperación de contraseña tiene prioridad sobre el onboarding.
- Persistir por usuario un estado `pending`, `in_progress`, `completed` o `skipped`, junto con versión, paso y fecha de finalización/omisión. Una tabla de perfil/preferencias con RLS permite retomarlo desde otro dispositivo.
- No utilizar `items.length === 0` como única señal de usuario nuevo: también puede ser un usuario veterano que vació su biblioteca o una carga fallida.
- Al desplegarlo, clasificar explícitamente las cuentas ya existentes para no obligarlas a realizarlo, incluidas las que todavía no tengan items. Ofrecerles acceso voluntario desde Ajustes.
- «Ahora no» persiste `skipped` y da acceso a la aplicación. No reaparece en cada login. Ajustes permite retomarlo.
- Si se cierra la pestaña a mitad, retomar el paso guardado. Si el item se guardó pero falló la actualización del estado del onboarding, recuperar ese progreso sin volver a insertar la obra.
- Reutilizar búsqueda, normalización y guardado existentes una vez corregidos; evitar un segundo flujo de persistencia exclusivo del onboarding.

### Medición y criterios de aceptación

Registrar eventos de inicio, paso completado, omisión y primer guardado confirmado, sin emails, reseñas ni títulos en los eventos de analítica. Medir porcentaje de cuentas que guardan un título, tiempo hasta ese primer guardado y retorno posterior; terminar las pantallas por sí solo no demuestra activación.

Comprobar con pruebas de integración: alta por email, alta por Google, vuelta tras interrumpir elegir nombre, recuperación de contraseña, omisión persistente, reanudación en otro dispositivo, cuenta antigua vacía, error al guardar, doble clic y recarga tras el primer guardado. Complementar con revisión visual móvil y navegación completa por teclado.

## Orden recomendado

1. Persistencia y mensajes de éxito; errores de carga; reenvío de verificación y acceso de cuentas incompletas.
2. Primer uso: acceso directo al buscador, estados vacíos claros, búsqueda sin resultados obsoletos y guardado fiable del primer título.
3. Onboarding de tres pasos, con persistencia por cuenta y medición de activación.
4. Identidad externa de obras, importación/exportación fiel, accesibilidad de componentes compartidos y coherencia de recomendaciones.
5. Paginar, reducir consultas repetidas, ordenar módulos y ampliar seguimiento de progreso según uso real.

No hay evidencia suficiente para recomendar reescribir la aplicación. La separación existente de store, acceso a datos y componentes permite corregir los fallos por etapas.
