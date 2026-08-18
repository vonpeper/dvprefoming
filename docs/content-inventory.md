# Inventario de Contenido - DV Performing Arts

Este documento detalla el inventario de datos y contenidos que deberán migrarse desde el WordPress en producción (`https://dvperformingarts.com/`) y organizarse en el nuevo sistema.

## 1. Contenidos Estáticos
Estos contenidos se mantendrán principalmente estáticos o editables mediante bloques fijos en el CMS local.
- **Información Institucional:**
  - Historia de la academia y filosofía de enseñanza.
  - Ubicación física (León, Guanajuato) y datos de contacto oficiales.
  - Reglamento interno de la academia.
- **Políticas de Privacidad y Términos:**
  - Aviso de privacidad para aspirantes y alumnos inscritos.
  - Términos de uso de la plataforma y condiciones de pago/devolución.

## 2. Contenidos Dinámicos
Contenidos de alta rotación que serán almacenados en la base de datos PostgreSQL o consultados mediante APIs externas.

### Programas y Clases
- **Datos a Migrar:**
  - Disciplinas actuales (Teatro, Canto, Danza, Jazz, etc.).
  - Horarios y frecuencias por grupo.
  - Rangos de edad correspondientes.
  - Requisitos de inscripción previos.

### Maestros e Instructores
- **Datos a Migrar:**
  - Nombre completo de cada maestro.
  - Fotografías profesionales de perfil.
  - Semblanza corta de trayectoria artística.
  - Especialidades o disciplinas que imparten.

### Obras y Producciones
- **Datos a Migrar:**
  - Archivo histórico de producciones de DV Performing Arts.
  - Ficha técnica de obras en cartelera (director, elenco, duración, sinopsis).
  - Fechas de presentaciones pasadas y futuras.

### Artículos de Blog (Manifiesto 21)
- **Estrategia:**
  - No se migrarán artículos directamente al CMS interno.
  - Se consumirán mediante el conector del motor editorial externo Manifiesto 21.
  - El listado e inventario completo de artículos se mantiene federado en la plataforma de Manifiesto 21.

## 3. Inventario de Archivos Multimedia (Assets)
- **Estrategia de Almacenamiento:**
  - Queda prohibido descargar de forma masiva o acoplar imágenes remotas sin validar su resolución y optimización.
  - En la fase de diseño visual se creará un bucket en Object Storage (compatible con S3) para almacenar imágenes, posters de obras y documentos de audiciones de forma optimizada.
  - El catálogo de imágenes públicas se procesará a través del componente `<Image>` de Next.js (`next/image`) para optimización automática en formatos webp/avif.
