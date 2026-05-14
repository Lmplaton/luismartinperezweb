# Luis Martín Pérez — Web personal

Sitio personal estático sobre **inteligencia artificial, comunicación, posicionamiento de marcas en IA y nuevos sistemas de prescripción**.

## Estructura

```
index.html                  Home
sobre-mi.html               Biografía + timeline
narrativa-dual.html         Marco conceptual 01
posicionamiento-ia.html     Marco conceptual 02
charlas.html                Charlas, docencia, formatos
podcast.html                «Esto es lo que AI»
ideas.html                  Archivo de ensayos (filtrable)
contacto.html               Email + LinkedIn + formulario

styles.css                  Sistema de diseño compartido
site.js                     Theme/accent/direction + nav + reveals
tweaks.js / tweaks.css      Panel de Tweaks (dirección visual, acento, modo)

robots.txt                  Permite crawlers de LLMs (GPTBot, ClaudeBot, PerplexityBot...)
sitemap.xml                 Sitemap completo
```

## Despliegue en Vercel

Es un sitio 100 % estático. Tres opciones:

1. **Drag-and-drop**: arrastra esta carpeta a `vercel.com/new`.
2. **CLI**: `npx vercel` desde la raíz del proyecto.
3. **Git**: empuja a un repo y conéctalo en Vercel — sin build step, framework: «Other».

`vercel.json` ya configura:

- **URLs limpias** (`/sobre-mi` en vez de `/sobre-mi.html`).
- Cache agresivo para assets estáticos (`max-age=31536000, immutable`).
- Cabeceras de seguridad básicas (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Optimización para LLMs (GEO / AEO)

- HTML semántico (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`).
- Jerarquía estricta H1 → H2 → H3 por página.
- JSON-LD Schema.org en todas las páginas (`Person`, `WebSite`, `AboutPage`, `Article`, `Blog`, `PodcastSeries`, `ContactPage`).
- Open Graph + Twitter Card.
- URLs limpias y semánticas.
- Meta descriptions específicas por página.
- `robots.txt` con permiso explícito para los principales crawlers LLM.
- Texto siempre indexable (nada dentro de imágenes).
- Conceptos clave repetidos consistentemente para reforzar entidad: *inteligencia artificial*, *intermediación algorítmica*, *posicionamiento en IA*, *narrativa dual*, *sistemas de prescripción*, *percepción*, *reputación*, *confianza*.

## Personalización

Edita las preferencias visuales abriendo el panel **Tweaks** (toggle en la barra superior del editor). Las preferencias se guardan en `localStorage` y persisten entre páginas. Disponible:

- **Dirección visual**: Editorial · Brutalista · Galería
- **Acento**: Ocre · Rojo tierra · Salvia · Tinta
- **Modo**: Claro · Oscuro

Para fijar el valor por defecto en producción, edita el bloque `EDITMODE-BEGIN…EDITMODE-END` en `tweaks.js`.

## Próximos pasos sugeridos

- Subir foto de retrato en `sobre-mi.html` (reemplazar el placeholder `.bio-photo`).
- Crear imagen `og-image.jpg` (1200×630) y añadir `<meta property="og:image">` en todas las páginas.
- Reemplazar `favicon.svg` por uno definitivo si lo deseas (incluir también `apple-touch-icon.png` 180×180).
- Conectar formulario de contacto a un servicio (Formspree, Vercel Forms, etc.).
- Conectar suscripción de newsletter en `ideas.html`.
- Reemplazar los ensayos placeholder por contenido real (mantener slugs semánticos).
