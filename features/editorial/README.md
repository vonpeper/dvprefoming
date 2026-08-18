# Feature: Motor Editorial Manifiesto 21 (`features/editorial`)

Este módulo implementa el adaptador para consumir artículos y posts desde la API externa del motor editorial Manifiesto 21.

## Responsabilidades Futuras
- Adaptador de API independiente, evitando acoplar la estructura externa a las páginas de Next.js.
- Procesador de webhook de publicación/edición para invalidar caché local bajo demanda (Revalidation).
