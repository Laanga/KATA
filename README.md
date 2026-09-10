# 型 Kata

Biblioteca personal de películas, series, libros y videojuegos. Busca títulos, guarda su estado, puntúa de **0 a 5** (incluido cero, medios puntos y sin puntuar), escribe notas y organiza colecciones.

Incluye una bienvenida opcional con modales breves dentro de la app, ayuda junto al buscador y progreso guardado por cuenta. También ofrece recomendaciones, estadísticas y acceso rápido a lo que estás leyendo, viendo o jugando.

## Desarrollo

Requisitos: Node.js 22.22.2+ (o 24.15+), npm y Supabase. Se utiliza únicamente `package-lock.json`.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Configura en `.env.local` la URL y clave pública de Supabase. TMDB e IGDB requieren sus claves de servidor; los libros usan Google Books con respaldo de Open Library. Las claves de servicio nunca se configuran como `NEXT_PUBLIC_*`.

Abre [localhost:3000](http://localhost:3000). Antes de usar la aplicación, aplica las migraciones según [la guía de base de datos](docs/BASE-DE-DATOS.md).

## Supabase local

Con Docker disponible:

```sh
npx supabase start -x realtime,studio,edge-runtime,logflare,vector,supavisor
npx supabase status
```

Usa los valores locales en `.env.local`. La configuración versionada utiliza los puertos 54321 (API), 54322 (PostgreSQL) y 54324 (correo de pruebas). Las cuentas de prueba son desechables; no se conectan a producción.

## Comprobaciones

```sh
npm run lint -- --max-warnings=0
npx next typegen
npm run typecheck
npm test
npm run build
node scripts/test-service-worker.mjs
npm audit
```

Pruebas reales de Auth, Storage, RLS e importación con Supabase local iniciado:

```sh
npx supabase status -o json > /tmp/kata-local-supabase.json
npm run test:integration
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f tests/db/library.sql -f tests/db/api.sql
```

El JSON temporal contiene credenciales locales: no se versiona. `KATA_LOCAL_CONFIG` permite indicar otra ruta. El script rechaza servidores que no sean locales y elimina sus cuentas de prueba al terminar.

CI ejecuta lint, tipos, pruebas, auditoría y build, además de una instancia independiente de Supabase para comprobar los datos.

## Datos y primera sesión

- Los usuarios nuevos pueden elegir categoría, guardar su primer título y abrir la biblioteca. «Ahora no» se recuerda; Ajustes permite retomar la bienvenida.
- Las cuentas anteriores a la migración no reciben la bienvenida obligatoriamente, aunque su biblioteca esté vacía.
- Importar permite fusionar conservando los datos existentes o reemplazar con confirmación. Se confirma el resultado después de guardarlo en la base de datos.
- JSON es la copia completa: títulos, colecciones y relaciones. CSV conserva los campos de los títulos, con comillas, saltos de línea y protección de fórmulas.
- Las estadísticas de finalización usan una fecha propia. No se inventan fechas históricas para títulos que ya estaban completados antes de la migración.
- La PWA conserva recursos estáticos y portadas. Autenticación, APIs y respuestas de Supabase requieren conexión; no hay edición privada offline.

Consulta [la revisión inicial](REVISION-PROYECTO.md), [el estado de implementación y pruebas](docs/IMPLEMENTACION.md) y [la guía de migración](docs/BASE-DE-DATOS.md).

## Sistema de diseño

Los componentes compartidos, tokens y reglas visuales se describen en [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md). El catálogo interactivo está disponible en `/design-system` con sesión iniciada.
