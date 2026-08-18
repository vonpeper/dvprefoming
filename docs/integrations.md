# Plan de Integraciones - DV Performing Arts

Este documento describe la arquitectura y las reglas de diseño para la integración de servicios de terceros en la plataforma.

---

## 1. Evolution API (WhatsApp)

### Arquitectura de Abstracción
Para evitar el acoplamiento directo y permitir una migración futura sin fricciones a la API oficial (WhatsApp Cloud API) u otro proveedor de mensajería, se implementará un patrón de fachada o proveedor abstracto.

```typescript
// features/messaging/types.ts
export interface MessagePayload {
  to: string;
  body: string;
}

export interface MessagingProvider {
  sendMessage(payload: MessagePayload): Promise<{ success: boolean; messageId?: string }>;
}
```
Cualquier código de la aplicación consumirá únicamente la interfaz `MessagingProvider`. La implementación concreta (`EvolutionApiProvider`) residirá exclusivamente dentro de `features/messaging/providers/`.

### Manejo de Errores y Resiliencia
> [!IMPORTANT]
> **Regla de Tolerancia a Fallos:** Un fallo en la infraestructura de mensajería (ej. Evolution API fuera de línea o token expirado) **nunca** debe interrumpir ni cancelar el proceso principal de inscripción a una audición o un registro de pago.
>
> Los mensajes de notificación se procesarán de forma asíncrona mediante una cola de tareas (ej. BullMQ con Redis o una cola basada en tablas de base de datos) con políticas de reintento exponencial y una bitácora detallada de errores en base de datos.

---

## 2. Pasarela de Pagos (Stripe)

### Checkout Sessions en Servidor
Todo el proceso de pago se gestionará del lado del servidor utilizando Stripe Checkout Sessions. 
- La interfaz del cliente redirecciona al usuario al portal seguro de Stripe.
- No se manejan ni procesan datos sensibles de tarjetas directamente en nuestra base de datos, cumpliendo al 100% con los estándares PCI-DSS.

### Webhooks como Fuente de Verdad
La sincronización definitiva del estado de pago del usuario (ej. confirmación de suscripción mensual, pago de audición) se realiza mediante un webhook en `/api/webhooks/stripe`.
- La ruta del webhook validará la firma de Stripe (`STRIPE_WEBHOOK_SECRET`) para cada evento.
- El webhook es el único responsable de actualizar la base de datos local con el estado del pago, previniendo fraudes o cancelaciones de red del lado del cliente.

---

## 3. Conector Editorial (Manifiesto 21)

### Desacoplamiento de la API
El contenido del blog se consume desde el motor editorial externo Manifiesto 21. Para evitar contaminar las páginas de la aplicación con payloads o formatos específicos de Manifiesto 21, se creará un adaptador:

- **Adaptador:** Traducirá los payloads devueltos por la API de Manifiesto 21 a nuestro formato común e interno `Article` definido en `types/mock.ts`.
- **Estrategia de Caché:** Las peticiones utilizarán el mecanismo de caché nativo de Next.js `fetch` con revalidación de datos bajo demanda basada en un webhook seguro (`MANIFIESTO21_WEBHOOK_SECRET`).

---

## 4. Almacenamiento de Archivos (Object Storage)

### Carga y Acceso de Assets
Todos los recursos multimedia (imágenes, posters, currículum de audiciones, comprobantes de pago) se guardarán en un servicio de Object Storage compatible con la API de Amazon S3 (ej. Cloudflare R2, AWS S3 o MinIO).
- Se configurarán URLs firmadas de corta duración para la carga y descarga de archivos privados (como currículums de audiciones).
- Los recursos públicos se expondrán bajo un dominio optimizado y se procesarán por el optimizador de imágenes de Next.js.
