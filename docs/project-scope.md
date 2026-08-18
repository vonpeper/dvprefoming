# Alcance del Proyecto - DV Performing Arts

Este documento define las fronteras y el alcance para la reconstrucción de la plataforma de la academia **DV Performing Arts**.

## 1. Regla de Oro
> [!IMPORTANT]
> El sitio web de producción actual basado en WordPress (`https://dvperformingarts.com/`) debe mantenerse 100% operativo y sin alteraciones. El desarrollo del nuevo sistema es completamente local y aislado. La sustitución y migración definitiva de producción ocurrirá únicamente tras validar exhaustivamente la nueva plataforma.

## 2. Fase 1: Base Técnica (Actual)

### Incluido en esta Fase
- **Inicialización del Framework:** Aplicación estructurada en Next.js con TypeScript estricto, Tailwind CSS y ESLint.
- **Arquitectura de Carpetas:** Configuración del árbol de directorios para soportar separación clara de responsabilidades (rutas públicas, layouts, dashboard, features).
- **Tipado Estricto de Datos:** Modelado en interfaces TS de Programas, Producciones, Maestros, Audiciones y Artículos.
- **Datos Simulados:** Conjunto de datos simulados neutros y marcados como borradores (`DRAFT`, `PLACEHOLDER`, `PENDING_CLIENT_INPUT`).
- **SEO Baseline:** Configuración inicial de `robots.ts` y `sitemap.ts` controlada dinámicamente mediante variables de entorno para evitar indexación no deseada en desarrollo y staging.
- **Documentación Completa:** Manuales y definiciones de la arquitectura e integraciones.

### Fuera de esta Fase
- Diseño visual definitivo ("Backstage Editorial") y hero de alta fidelidad.
- Gestor de contenidos (CMS) funcional y base de datos activa.
- Lógica de autenticación de usuarios.
- Formularios de audición conectados y pasarela de pagos con Stripe.
- Integración real con Evolution API (WhatsApp) o Resend (Emails).
- Despliegues en servidores staging o producción.

## 3. Fases Futuras

- **Fase 2: Diseño Visual y Capa Frontend (Pública)**
  - Implementación del sistema de diseño premium "Backstage Editorial" (urbano, chic, escénico, tipografía de revista).
  - Páginas públicas funcionales (programas de clases, producciones del cartel, maestros).
- **Fase 3: CMS de Bloques Controlados e Integración Editorial**
  - Implementación del CMS interno estructurado por bloques JSON.
  - Conexión con el motor editorial externo Manifiesto 21.
- **Fase 4: Core de Negocio (Audiciones, Pagos y Mensajería)**
  - Configuración de base de datos PostgreSQL (con Prisma).
  - Sistema transaccional de folios y flujo de audición.
  - Pagos recurrentes y únicos mediante Stripe.
  - Notificaciones automatizadas mediante Evolution API y Resend.
- **Fase 5: Panel de Control (Dashboard) y Cuentas**
  - Espacio interactivo para alumnos, instructores y administradores.
  - Bitácora de actividad administrativa.

## 4. Riesgos del Proyecto

- **Modificación Accidental del WordPress en Producción:** Se mitiga manteniendo las claves y entornos completamente aislados, y desarrollando 100% en local.
- **Indexación Prematura en Buscadores:** Se previene mediante la regla de robots dinámica dependiente de `SITE_INDEXING_ENABLED=false` en entornos de desarrollo y staging.
- **Bloqueo del Proceso de Audición por Fallo de Mensajería:** Si Evolution API no responde, el registro no debe cancelarse. Se mitigará con una cola de mensajería asíncrona.
- **Desorganización del CMS:** El uso de un constructor visual desestructurado podría corromper la estética premium. Se solucionará limitando el CMS a bloques controlados y validados por código.

## 5. Preguntas Pendientes al Cliente
1. ¿Cuál es el dominio definitivo de producción a configurar en `NEXT_PUBLIC_SITE_URL`?
2. ¿Qué estructura exacta de bloques de contenido se requiere para el Home y los Programas en el CMS?
3. ¿Cuál es la lógica exacta de negocio para la asignación de folios de audición (ej. prefijo, numeración anual)?
4. ¿Qué datos y campos del formulario de audiciones actual deben preservarse de forma obligatoria?
5. ¿Qué volumen aproximado de usuarios y transacciones concurrentes se proyecta para el día de lanzamiento de audiciones?
