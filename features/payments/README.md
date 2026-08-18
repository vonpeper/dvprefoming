# Feature: Pasarela de Pagos (`features/payments`)

Este módulo encapsula la integración con Stripe para el procesamiento de pagos únicos y suscripciones recurrentes.

## Responsabilidades Futuras
- Creación de Checkout Sessions en el lado del servidor.
- Procesamiento y verificación de firmas de Webhooks de Stripe.
- Sincronización del estado de facturación del alumno con la base de datos local.
