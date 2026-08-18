# Estrategia SEO Baseline - DV Performing Arts

Este documento detalla la configuración de SEO técnico inicial, las políticas de indexación y los metadatos de la plataforma.

## 1. Control Dinámico de Indexación por Entorno

Para evitar que los motores de búsqueda indexen entornos de desarrollo o pruebas locales y staging (lo que causaría penalizaciones por contenido duplicado del sitio WordPress activo), la indexación se gestiona mediante la variable de entorno `SITE_INDEXING_ENABLED`.

| Entorno | `SITE_INDEXING_ENABLED` | Estatus de Crawling | Comportamiento Esperado |
| :--- | :--- | :--- | :--- |
| **Local (Desarrollo)** | `false` (Predeterminado) | Bloqueado | Robots bloquea el acceso a `/`. Layout inyecta `noindex, nofollow`. |
| **Staging (Pruebas)** | `false` | Bloqueado | Robots bloquea el acceso a `/`. Layout inyecta `noindex, nofollow`. |
| **Producción (Migrado)** | `true` | Permitido | Crawling libre. Layout inyecta `index, follow`. |

### Configuración de Robots (`app/robots.ts`)
El archivo [robots.ts](../app/robots.ts) evalúa dinámicamente la variable y retorna reglas restrictivas si está desactivada:
- Si es `false`:
  ```txt
  User-agent: *
  Disallow: /
  ```
- Si es `true`:
  ```txt
  User-agent: *
  Allow: /
  Sitemap: https://dvperformingarts.com/sitemap.xml
  ```

### Meta-etiquetas de Layout (`app/layout.tsx`)
Next.js inyecta de forma dinámica las meta-etiquetas de robots basadas en la misma variable:
```typescript
robots: {
  index: process.env.SITE_INDEXING_ENABLED === "true",
  follow: process.env.SITE_INDEXING_ENABLED === "true",
}
```
Esto genera en el HTML resultante:
- Desactivado: `<meta name="robots" content="noindex, nofollow" />`
- Activado: `<meta name="robots" content="index, follow" />`

---

## 2. Mapa del Sitio (`app/sitemap.ts`)

El generador de sitemap dinámico [sitemap.ts](../app/sitemap.ts) genera un listado XML estructurado.
- **Ruta base:** Utiliza la variable `NEXT_PUBLIC_SITE_URL` para construir URLs absolutas correctas.
- **Seguridad local:** Cuenta con un fallback seguro (`http://localhost:3000`) para compilaciones locales y pruebas del build.
- **Rutas válidas:** En esta fase inicial, el sitemap incluye únicamente la raíz `/` para evitar exponer páginas inexistentes o temporales. En fases futuras, se añadirán dinámicamente las rutas de programas y producciones activas en base de datos.

---

## 3. Estructura de Metadatos y Datos Estructurados (Fase Futura)

### Jerarquía Semántica HTML5
- Un único elemento `<h1>` por página, que describa el título principal.
- Uso correcto de etiquetas semánticas (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).

### JSON-LD (Schema.org)
En la Fase 2/4 se inyectarán datos estructurados en formato JSON-LD para enriquecer la visualización del sitio en los resultados de búsqueda de Google (Rich Snippets):
- **LocalBusiness:** Inyectado en el Home para indicar dirección física, teléfonos, logotipo e identidad de la academia en León, Gto.
- **Course:** Inyectado en cada página de programa/clase para estructurar el nombre del curso, grupo de edad y horarios.
- **Event:** Inyectado en la cartelera de obras y producciones, detallando las fechas de funciones, ubicación del teatro y venta de boletos.
