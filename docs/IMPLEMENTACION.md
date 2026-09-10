# Correcciones y onboarding — resultado

10 de septiembre de 2026. Cambios implementados en el checkout local; **no se ha modificado ni desplegado producción**. La revisión inicial permanece en `REVISION-PROYECTO.md` como referencia del estado anterior.

## Trabajo completado

- [x] Importar/vaciar persiste mediante RPC transaccionales. Fusión por defecto, vista previa y confirmación explícita para reemplazar.
- [x] Añadir, editar y borrar esperan la respuesta del servidor. Los errores conservan formularios y permiten reintentar; una carga fallida no se presenta como biblioteca vacía.
- [x] Identidad externa por proveedor/ID, compatibilidad con registros anteriores y fecha propia de finalización.
- [x] JSON con colecciones y relaciones; CSV con campos multilínea, comillas, cero, portadas y escape reversible de fórmulas. Restauración de fechas de creación, actualización y finalización.
- [x] Sesión centralizada, limpieza al cambiar de cuenta y recuperación de cuentas que no eligieron nombre. Verificación permite introducir/revisar email sin sesión.
- [x] Búsqueda compartida cancelable, respuestas normalizadas, errores y reintento por proveedor. Respaldo de Open Library cuando Google Books falla.
- [x] Onboarding de tres pasos, opcional y persistente. Se retoma desde Ajustes; las cuentas antiguas, incluso vacías, quedan excluidas del arranque obligatorio.
- [x] Diálogos nativos con foco/Escape, controles de valoración accesibles, etiquetas móviles, acciones disponibles por tacto/foco, portadas de reserva y movimiento reducido.
- [x] Descubrimiento con caché por cuenta/preferencias, géneros específicos de TV, períodos coherentes para libros y conservación de metadata.
- [x] Estadísticas sin mutar el store ni inventar barras; finalización independiente de ediciones de notas. Sección «Continúa donde lo dejaste» con acceso a editar estado.
- [x] Paginación de items/colecciones y relaciones en bloque, sin una consulta por cada colección.
- [x] APIs autenticadas, cuota compartida en PostgreSQL, timeouts de proveedores y reutilización del token de IGDB.
- [x] PWA sin caché de APIs, Supabase o rutas privadas; limpieza de cachés privadas heredadas. Prueba del worker generado, no solo de su configuración.
- [x] Avatares con rutas por propietario y sustitución que conserva la foto anterior si falla el guardado del perfil.
- [x] Tipos de Supabase generados, npm como único gestor, dependencias corregidas, tests versionados, CI y documentación de migraciones.

El seguimiento numérico de páginas/episodios/horas sigue siendo una posible evolución de producto, tal como se proponía en la revisión. Esta entrega añade «Continuar» y seguimiento de estados; no inventa un modelo numérico sin reglas por tipo.

## Evidencia de comprobación

| Comprobación | Resultado local |
| --- | --- |
| `npm run lint -- --max-warnings=0` | Sin errores ni avisos. |
| `npm run typecheck` y TypeScript del build | Correctos. |
| `npm test` | **27 pruebas, 7 archivos, todas pasan**. Incluyen carreras de búsqueda, carga/sesión, fallos de guardado, reintento tras insertar, CSV/JSON y onboarding. |
| `npm run build` | Build de producción completo con Next.js 16.3.4; 24 páginas generadas. |
| Auditoría del lockfile | **0 vulnerabilidades** reportadas. |
| PostgreSQL con datos previos al cambio | Conserva título, nota y valoración cero. Las dos cuentas existentes, incluida una vacía, quedan `skipped`; no se inventa `completed_at`. |
| Supabase real local: SQL | RLS con dos usuarios, títulos homónimos por ID, relaciones, borrado limitado al propietario, rollback de reemplazo inválido y límites compartidos: pasan. |
| Supabase real local: SDK | Auth, preferencias nuevas/omisión/reanudación, importación, fechas restauradas, cero, borrado de notas y Storage con dos propietarios: pasan. Las cuentas creadas por el script se eliminan al acabar. |
| Rol anónimo | Sin ejecución de importación/vaciado/cuota. Se añadió revocación explícita porque Supabase otorga privilegios directos por defecto además de PUBLIC. |
| Navegador, escritorio | Login, bienvenida, categoría, búsqueda real, primer guardado, recarga, biblioteca persistida, reanudación desde Ajustes y omisión persistente comprobados. |
| Navegador, móvil 390×844 | Edición con diálogo por encima de navegación, valoración cero, cambio de estado y borrado de reseña comprobados. Vista restaurada después de la prueba. |
| Cuenta incompleta | Tanto login como acceso directo a `/library` conducen a elegir nombre; después se accede a la bienvenida. |
| HTTP de producción | Las 9 APIs privadas responden 401 sin sesión y `Cache-Control: private, no-store`; Biblioteca redirige sin sesión. |
| Worker generado | `scripts/test-service-worker.mjs` ejecuta los matchers y comprueba NetworkOnly, ausencia de caché de inicio/páginas y limpieza de cachés antiguas. Detectó y permitió corregir dos particularidades de serialización/configuración del plugin. |
| CI | Workflow configurado para repetir checks y arrancar Supabase independiente. Todavía no se ha ejecutado en GitHub. |

## Límites y despliegue

La instancia local usa Auth, PostgREST, PostgreSQL y Storage reales de Supabase, pero es desechable. **No es una verificación de las políticas y credenciales actualmente desplegadas**.

Faltan las credenciales externas de TMDB/IGDB y la configuración remota de Google OAuth/SMTP. Se han comprobado los fallos y reintentos disponibles; el recorrido real de esos proveedores, la confirmación por correo y la recuperación completa deben probarse en staging con sus credenciales. Los libros sí se buscaron en un proveedor real desde el navegador.

No se ha hecho una prueba de carga de gran volumen ni una simulación completa de red offline en un dispositivo instalado. La comprobación de privacidad de la PWA cubre las rutas y estrategias del worker generado y la limpieza de cachés antiguas; la aplicación requiere conexión para datos privados.

Antes del despliegue, sigue [BASE-DE-DATOS.md](BASE-DE-DATOS.md): copia de seguridad, comparación del baseline, migraciones en staging y después código. Revisa las políticas de Storage antiguas, si las hay; no se eliminan personalizaciones remotas a ciegas.

Los registros completados antiguos conservan fecha de finalización desconocida. Las obras sin identificador externo conservan su identidad heredada; no se asignan IDs a títulos ambiguos automáticamente.

## Ajuste de bienvenida: guía contextual con modales

La bienvenida se muestra sobre la aplicación, sin una pantalla de registro adicional ni redirecciones obligatorias durante la exploración:

1. Modal breve de bienvenida con una categoría, «Vamos a buscar» y «Ahora no». Cerrar también omite la guía de forma persistente.
2. Ayuda junto al buscador real, con una consulta de ejemplo opcional. La navegación sigue disponible. El modal de guardado muestra el estado; notas y valoración están plegadas y son opcionales.
3. Confirmación sobre Biblioteca con el título guardado y una explicación de Editar. Cerrar o pulsar «Ver mi biblioteca» completa la guía; también se puede buscar otro título.

Se reutilizan las preferencias y RPC existentes: **este ajuste no requiere nuevas migraciones**. Ajustes sigue permitiendo retomarlo. Se ha comprobado el recorrido con una cuenta local y búsqueda real de libros, en móvil 390×844; las pruebas cubren errores, omisión, categoría, guardado mínimo y finalización. También se comprobó la compilación y el worker generado.

La retención real requiere medir uso después del alta; el cambio reduce pasos obligatorios y explicaciones previas, sin prometer una mejora de retención todavía no medida.

## Preparación del despliegue

El propietario aplicó manualmente las migraciones remotas y compartió la verificación correcta del esquema, permisos y Storage. Confirmó además que la configuración de Auth era correcta. Véase BASE-DE-DATOS.md para el historial CLI pendiente. El sistema visual compartido y su catálogo están descritos en DESIGN-SYSTEM.md.
