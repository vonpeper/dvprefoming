# DV Performing Arts - Plataforma Web (Reconstrucción)

Este repositorio contiene la reconstrucción técnica de la plataforma web de la academia de artes escénicas **DV Performing Arts** en León, Guanajuato. Se ha migrado desde un sitio WordPress clásico hacia una aplicación web moderna utilizando Next.js.

> [!IMPORTANT]
> **Sitio en Producción:** El sitio web original en WordPress (`https://dvperformingarts.com/`) se encuentra activo en producción y **no debe ser modificado, reemplazado, ni afectado** de ninguna forma por este proyecto local. La migración definitiva sólo ocurrirá tras la validación final del cliente.

## Entorno Técnico

- **Node.js:** Versión recomendada `v24.19.0` (definida en `.node-version`).
- **Framework:** Next.js (App Router, TypeScript estricto, Tailwind CSS).
- **Gestor de Paquetes:** `npm`.

### Ajuste de Entorno (PATH) en Sistemas de Desarrollo
Si el entorno de ejecución (como en terminales restringidas de Windows) no cuenta con `node` o `npx` en el `PATH` global de forma directa, se pueden ejecutar los comandos de la siguiente manera:
```powershell
$env:Path += ";C:\Program Files\nodejs"; npm run dev
```

## Estructura del Repositorio

La arquitectura está diseñada modularmente mediante *Features* y *Components*:
- `app/` - Rutas públicas, de autenticación, panel administrativo y APIs.
- `features/` - Lógica de negocio encapsulada (audiciones, pagos, mensajería, cms).
- `components/` - Elementos visuales (UI atómicos, de layout y secciones).
- `lib/` - Clientes globales y funciones auxiliares.
- `types/` - Tipados estrictos compartidos.
- `data/` - Datos provisorios neutrales para simulación.
- `docs/` - Documentación detallada del proyecto.

## Comandos del Proyecto

- **Iniciar servidor de desarrollo:**
  ```bash
  npm run dev
  ```
- **Realizar análisis estático (Lint):**
  ```bash
  npm run lint
  ```
- **Comprobar tipos de TypeScript (Strict):**
  ```bash
  npm run ts-check
  ```
- **Generar build de producción local:**
  ```bash
  npm run build
  ```
- **Iniciar servidor con build de producción:**
  ```bash
  npm run start
  ```

## Documentación del Proyecto

Para más detalles, consulta la carpeta `docs/`:
- [Alcance del Proyecto](./docs/project-scope.md)
- [Arquitectura de Software](./docs/architecture.md)
- [Modelado de Datos](./docs/data-model.md)
- [Plan de Integraciones](./docs/integrations.md)
- [Estrategia SEO Baseline](./docs/seo-baseline.md)
- [Roadmap del Proyecto](./docs/roadmap.md)
- [Registro de Decisiones de Arquitectura (ADR)](./docs/decisions/README.md)
