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

[Demo en vivo](https://katalibrary.vercel.app/)

</div>

---

## ✨ ¿Qué es Kata?

**Kata** (型 - "forma" en japonés) es una aplicación web que te permite crear tu **biblioteca personal multimedia**. Busca contenido real usando APIs profesionales, organiza tu colección y lleva un registro de todo lo que has visto, leído o jugado.

<div align="center">
  <img src="https://kozaaowscbupshdxqdqu.supabase.co/storage/v1/object/sign/fotos/landing.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMWIwN2IwZC0zYWQ2LTQ3ODQtOWFlYi1iMGRlMzY3Mzc4ZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9sYW5kaW5nLnBuZyIsImlhdCI6MTc2ODc1MTc1NywiZXhwIjoxODAwMjg3NzU3fQ.pNoZVn0OJ_IZMNa_61iAMcjiKdBTR_qu-EireMN0nCo" alt="Preview" width="80%">
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
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

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

> 💡 Las instrucciones para obtener las API keys están en `.env.example`

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

| Home | Perfil |
|:------------:|:---------:|
| <img src="https://kozaaowscbupshdxqdqu.supabase.co/storage/v1/object/sign/fotos/home.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMWIwN2IwZC0zYWQ2LTQ3ODQtOWFlYi1iMGRlMzY3Mzc4ZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9ob21lLnBuZyIsImlhdCI6MTc2ODc1MTc5MywiZXhwIjoxODAwMjg3NzkzfQ.oo7Vwj-QXkQT19ssFIsWH50QSaUKE-vLuFT_LIT1V0Q" alt="Landing"> | <img src="https://kozaaowscbupshdxqdqu.supabase.co/storage/v1/object/sign/fotos/perfil.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMWIwN2IwZC0zYWQ2LTQ3ODQtOWFlYi1iMGRlMzY3Mzc4ZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9wZXJmaWwucG5nIiwiaWF0IjoxNzY4NzUxODEwLCJleHAiOjE4MDAyODc4MTB9.29svb_ik8t-gRHUhQvpZ94OfQuzDvk8UQ73LrRqSlGg" alt="Dashboard"> |

| Búsqueda | Biblioteca |
|:--------:|:----------:|
| <img src="https://kozaaowscbupshdxqdqu.supabase.co/storage/v1/object/sign/fotos/busqueda.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMWIwN2IwZC0zYWQ2LTQ3ODQtOWFlYi1iMGRlMzY3Mzc4ZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9idXNxdWVkYS5wbmciLCJpYXQiOjE3Njg3NTE4MjMsImV4cCI6MTgwMDI4NzgyM30.mJYXmKw25IkoUhHk84UiMQtvIWp6Nq7XV-RBQFfVhoM" alt="Search"> | <img src="https://kozaaowscbupshdxqdqu.supabase.co/storage/v1/object/sign/fotos/biblio.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMWIwN2IwZC0zYWQ2LTQ3ODQtOWFlYi1iMGRlMzY3Mzc4ZWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9iaWJsaW8ucG5nIiwiaWF0IjoxNzY4NzUxODQyLCJleHAiOjE4MDAyODc4NDJ9.7kEYeu1UjWH5V9kQc8xyWL3CM3LOQLumbG-MD0bO31M" alt="Library"> |

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
