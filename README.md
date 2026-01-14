<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24&height=200&section=header&text=型%20Kata&fontSize=80&fontAlignY=35&desc=Tu%20biblioteca%20personal%20de%20medios&descAlignY=55&animation=fadeIn">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24&height=200&section=header&text=型%20Kata&fontSize=80&fontAlignY=35&desc=Tu%20biblioteca%20personal%20de%20medios&descAlignY=55&animation=fadeIn">
</picture>

<div align="center">

**Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Demo en vivo](#) · [Reportar Bug](../../issues) · [Solicitar Feature](../../issues)

</div>

---

## ✨ ¿Qué es Kata?

**Kata** (型 - "forma" en japonés) es una aplicación web que te permite crear tu **biblioteca personal multimedia**. Busca contenido real usando APIs profesionales, organiza tu colección y lleva un registro de todo lo que has visto, leído o jugado.

<div align="center">
  <img src="https://placehold.co/800x450/1a1a2e/fff?text=Coming+Soon..." alt="Preview" width="80%">
</div>

---

## 🎯 Características Principales

<table>
<tr>
<td width="50%">

### 🔍 Búsqueda Inteligente
Encuentra películas, series, libros y videojuegos con datos reales de **TMDB**, **IGDB** y **Google Books**. Portadas en HD, sinopsis, géneros y más.

</td>
<td width="50%">

### 📊 Estadísticas Visuales
Dashboard con métricas de tu biblioteca: distribución por tipo, estados, valoraciones medias y actividad reciente.

</td>
</tr>
<tr>
<td width="50%">

### 🎮 Tracking de Progreso
Marca contenido como **Pendiente**, **En progreso**, **Completado** o **Abandonado**. Cada tipo de medio tiene sus propios estados.

</td>
<td width="50%">

### ⭐ Sistema de Valoración
Puntúa del 0 al 10 con medios puntos. Escribe reseñas personales para recordar qué te pareció cada título.

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Cuenta Personal
Regístrate y accede desde cualquier dispositivo. Tu biblioteca se sincroniza en la nube con **Supabase**.

</td>
<td width="50%">

### 🎨 Diseño Moderno
Interfaz oscura con animaciones fluidas. Cards 3D interactivas, transiciones suaves y diseño responsive.

</td>
</tr>
</table>

---

## 📱 Tipos de Contenido

<div align="center">

| 🎬 **Películas** | 📺 **Series** | 📚 **Libros** | 🎮 **Videojuegos** |
|:---:|:---:|:---:|:---:|
| Datos de TMDB | Datos de TMDB | Google Books | IGDB (Twitch) |
| Año, director, sinopsis | Temporadas, episodios | Autor, editorial, páginas | Plataformas, géneros |

</div>

---

## 🚀 Comenzar

### Requisitos Previos

- [Bun](https://bun.sh/) o [Node.js](https://nodejs.org/) 18+
- Cuenta en [Supabase](https://supabase.com/) (gratis)

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/kata.git
cd kata

# 2. Instala dependencias
bun install

# 3. Configura variables de entorno
# Crea un archivo .env.local con las siguientes variables:

# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# TMDB API (requerido para películas y series)
TMDB_API_KEY=tu_tmdb_api_key

# IGDB API (requerido para videojuegos)
IGDB_CLIENT_ID=tu_igdb_client_id
IGDB_CLIENT_SECRET=tu_igdb_client_secret

# Google Books API (opcional, para evitar límites de rate)
GOOGLE_BOOKS_API_KEY=tu_google_books_api_key

# Site URL (opcional, para producción)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 4. Ejecuta en desarrollo
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) y ¡listo! 🎉

---

## 🔑 APIs Utilizadas

Para obtener datos reales de contenido multimedia, Kata utiliza:

| API | Contenido | ¿Requiere Key? |
|-----|-----------|----------------|
| [TMDB](https://www.themoviedb.org/documentation/api) | Películas y Series | Sí (gratis) |
| [IGDB](https://api-docs.igdb.com/) | Videojuegos | Sí (cuenta Twitch) |
| [Google Books](https://developers.google.com/books) | Libros | Opcional |

> 💡 **Cómo obtener las API keys:**
> - **Supabase**: Ve a tu [dashboard de Supabase](https://supabase.com/dashboard) → Settings → API
> - **TMDB**: Regístrate en [TMDB](https://www.themoviedb.org/) → Settings → API → Request API Key
> - **IGDB**: Crea una app en [Twitch Developer Console](https://dev.twitch.tv/console/apps) (usa IGDB API)
> - **Google Books**: Opcional, en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## 🛠️ Stack Tecnológico

<div align="center">

| Frontend | Backend | Base de Datos | Animaciones |
|:--------:|:-------:|:-------------:|:-----------:|
| Next.js 16 | API Routes | Supabase | GSAP |
| React 19 | Supabase Auth | PostgreSQL | Lenis |
| TypeScript | Row Level Security | - | - |
| Tailwind CSS | - | - | - |
| Zustand | - | - | - |

</div>

---

## 📂 Estructura del Proyecto

```
src/
├── app/                    # Páginas (App Router)
│   ├── (public)/          # Landing, Login, Signup
│   ├── api/               # API Routes (proxy de APIs externas)
│   ├── library/           # Biblioteca personal
│   ├── profile/           # Perfil de usuario
│   └── [movies|series|books|games]/  # Páginas por categoría
│
├── components/            # Componentes React
│   ├── ui/               # Botones, Modales, Selects...
│   ├── media/            # Cards, Búsqueda, Modales de items
│   ├── dashboard/        # Widgets del dashboard
│   └── layout/           # Navbar, Footer...
│
├── lib/
│   ├── store.ts          # Estado global (Zustand)
│   └── supabase/         # Cliente y funciones de Supabase
│
└── types/                # Tipos de TypeScript
```

---

## 🎨 Capturas de Pantalla

<div align="center">

| Landing Page | Dashboard |
|:------------:|:---------:|
| <img src="https://placehold.co/400x250/1a1a2e/fff?text=Coming+Soon..." alt="Landing"> | <img src="https://placehold.co/400x250/1a1a2e/fff?text=Coming+Soon..." alt="Dashboard"> |

| Búsqueda | Biblioteca |
|:--------:|:----------:|
| <img src="https://placehold.co/400x250/1a1a2e/fff?text=Coming+Soon..." alt="Search"> | <img src="https://placehold.co/400x250/1a1a2e/fff?text=Coming+Soon..." alt="Library"> |

</div>

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del proyecto
2. Crea tu rama (`git checkout -b feature/NuevaFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva feature'`)
4. Push a la rama (`git push origin feature/NuevaFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Proyecto personal de código abierto. Úsalo como quieras.

---

<div align="center">

**Hecho con ❤️ y mucho ☕**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24&height=100&section=footer">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=24&height=100&section=footer">
</picture>

</div>
