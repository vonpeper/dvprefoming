# Feature: Proveedor de Mensajería (`features/messaging`)

Este módulo encapsula las notificaciones automáticas vía correo electrónico (Resend) y WhatsApp (Evolution API).

## Responsabilidades Futuras
- Interfaz abstracta de mensajería (`MessagingProvider`) para aislar la dependencia directa de Evolution API y permitir migrar fácilmente a otras soluciones como WhatsApp Cloud API.
- Cola de envío, sistema de reintentos y bitácora de errores para asegurar que fallos de red/mensajería nunca bloqueen transacciones core del sistema (ej. registros a audición).
