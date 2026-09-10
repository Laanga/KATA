# Base de datos y despliegue

La fuente de verdad es `supabase/migrations/`, en orden. `supabase-schema.sql` es únicamente el esquema histórico de partida; no contiene las ampliaciones actuales.

## Proyecto nuevo

Con Supabase local, `npx supabase start` aplica todas las migraciones. Con un proyecto remoto vacío, enlaza el proyecto y revisa `npx supabase db push --dry-run` antes de aplicar `npx supabase db push`. La aplicación necesita las migraciones antes del despliegue del código.

## Proyecto existente con el esquema antiguo

1. Obtén una copia de seguridad y compara el esquema desplegado con `202609100000_baseline.sql`. Revisa especialmente índices únicos, políticas y cualquier personalización.
2. Si ese baseline ya está aplicado y coincide, registra **solo** esa versión como aplicada: `npx supabase migration repair 202609100000 --status applied`. No ejecutes otra vez el baseline ni marques como aplicadas las ampliaciones pendientes.
3. Revisa las migraciones pendientes con `npx supabase db push --dry-run`. Aplícalas primero a una copia de staging. Las migraciones 001–006 preservan los títulos existentes; no rellenan una fecha de finalización inventada.
4. Comprueba los flujos con dos cuentas de staging y despliega el código después de las migraciones.

Durante la implementación se probaron las migraciones en bases locales desechables. Posteriormente, el propietario aplicó manualmente las migraciones 001–006 en su proyecto remoto mediante SQL Editor. El resultado de `scripts/sql/verificar-supabase.sql` compartido por el propietario confirmó las tablas, RLS, índices, triggers, permisos de RPC y configuración de avatares previstos. Esto no sustituye la prueba funcional del nuevo código desplegado.

Antes de 001 se añadió el índice único de nombres de colección, se establecieron las fechas de media_items como NOT NULL (no había nulos) y se eliminó el trigger redundante `update_media_items_updated_at`, conservando `set_updated_at`. El esquema remoto conserva otras diferencias históricas, como la restricción de iconos y algunos índices duplicados.

**Historial CLI pendiente de reconciliar:** las ejecuciones manuales no registran las versiones en `supabase_migrations`. No ejecutar `db push` contra ese proyecto hasta comparar el esquema y registrar las migraciones ya aplicadas; no volver a ejecutar 000–006. El workflow de CI utiliza únicamente Supabase local y no aplica migraciones remotas.

## Qué cambia

| Versión | Cambio |
| --- | --- |
| 000 | Esquema histórico: items, colecciones, relaciones y RLS. |
| 001 | Identidad externa, finalización, preferencias de onboarding y RPC transaccionales. Todas las cuentas preexistentes se clasifican como `skipped`. |
| 002 | Límite compartido de 120 solicitudes por minuto y usuario; protección del primer título asociado al onboarding. |
| 003 | Integridad del par proveedor/ID y restricciones de títulos/estados para escrituras nuevas. Las restricciones `NOT VALID` evitan invalidar filas históricas desconocidas. |
| 004 | Bucket de avatares y políticas de escritura/borrado limitadas al propietario. |
| 005 | Revocación explícita de ejecución de las RPC al rol anónimo, además de PUBLIC. |
| 006 | Importación preserva fechas de creación y actualización, además de finalización. |

Los títulos sin ID externo conservan su identidad heredada por título normalizado. No se asignan automáticamente IDs externos a datos históricos ambiguos. Obras distintas con el mismo título pueden coexistir cuando tienen diferentes IDs de proveedor.

## Avatares

Bucket `avatars`, público para lectura, máximo 2 MB, JPG/PNG/WebP/GIF. Rutas nuevas: `<user-id>/<uuid>.<ext>`. La subida guarda primero el archivo, actualiza el perfil y luego limpia la foto anterior. Un error de actualización conserva la foto anterior.

Si el bucket ya existía, verifica su visibilidad pública y elimina **solo después de revisar** políticas antiguas demasiado amplias: las políticas de PostgreSQL se combinan con OR, por lo que una política permisiva antigua puede anular el aislamiento pretendido. Las migraciones no borran políticas personalizadas a ciegas.

## Auth y correo

Configura Site URL y Redirect URLs para `/auth/callback` y recuperación de contraseña. Google requiere configurar su proveedor y credenciales en Supabase. La confirmación de email, SMTP y OAuth remotos deben probarse en staging con esa configuración; la instancia local utiliza el buzón de prueba, sin enviar correo a personas reales.

## Recuperación y tipos

Las RPC de importación y vaciado se ejecutan en una transacción: un fallo no confirma borrados parciales. Esto no sustituye la copia de seguridad previa a un reemplazo intencionado.

Para volver a una versión anterior de la aplicación, prioriza revertir el código manteniendo las columnas adicionales. No elimines columnas o tablas que ya contengan preferencias o identidades nuevas. Restaurar la base completa requiere una copia verificada y detener escrituras.

Regenera los tipos después de modificar el esquema:

```sh
npx supabase gen types typescript --local > src/types/database.generated.ts
npm run typecheck
```
