# Registro de Decisiones de Arquitectura (ADR) - DV Performing Arts

Este directorio documenta las decisiones técnicas clave de diseño de software adoptadas para el proyecto.

## Índice de Decisiones

### [ADR-001] Elección del Framework: Next.js (App Router)
- **Estatus:** Aprobado.
- **Contexto:** La plataforma requiere un alto rendimiento, excelente SEO técnico (RSC), generación dinámica de páginas e integraciones complejas en servidor (Stripe, base de datos, Evolution API).
- **Decisión:** Usar Next.js con el sistema App Router (strict TypeScript, Tailwind CSS).
- **Consecuencias:** Mayor velocidad en carga inicial, indexación optimizada de datos estáticos y dinámicos, soporte nativo de Server Components y Server Actions para reducir código cliente.

### [ADR-002] Modularidad por Características (Features)
- **Estatus:** Aprobado.
- **Contexto:** El proyecto escalará incluyendo áreas dispares (CMS, pagos, audiciones, mensajería). Mantenerlos todos en directorios genéricos como `components/` o `lib/` propiciaría acoplamiento.
- **Decisión:** Agrupar lógica, tipos de datos específicos y llamadas de API en la carpeta `/features` separada por dominio (ej. `features/auditions`).
- **Consecuencias:** Código altamente cohesivo y desacoplado, facilidad de mantenimiento e identificación de errores, y escalabilidad en paralelo para desarrolladores.

### [ADR-003] Control Dinámico de Indexación (Robots & Sitemap)
- **Estatus:** Aprobado.
- **Contexto:** Se requiere prevenir que Google indexe entornos locales y de pruebas (Staging) mientras el WordPress actual está en producción.
- **Decisión:** Controlar el rastreo dinámicamente en `robots.ts` y meta-etiquetas utilizando la variable de entorno `SITE_INDEXING_ENABLED` en lugar de evaluar únicamente si es desarrollo o producción.
- **Consecuencias:** Evita errores de indexación accidental al poder activar o desactivar el rastreo de forma totalmente manual en cualquier entorno mediante variables de configuración.

### [ADR-004] Aislamiento de Integraciones de Terceros
- **Estatus:** Aprobado.
- **Contexto:** Integraciones clave como Evolution API (WhatsApp) o Manifiesto 21 (Blog) pueden cambiar de proveedor en el futuro.
- **Decisión:** Encapsular todas las llamadas externas detrás de adaptadores o interfaces (ej. `MessagingProvider`). La UI nunca debe interactuar de forma directa con las APIs externas.
- **Consecuencias:** Facilidad para cambiar de proveedor tecnológico, protección de la UI frente a cambios en APIs externas y mayor facilidad para crear pruebas automatizadas unitarias/mockups.
