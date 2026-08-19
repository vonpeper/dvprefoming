<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:propodvps1-operations-directive -->
# Directivas de Operación y Despliegue en propodvps1

Este proyecto corre en producción en el servidor **`propodvps1`** de Prosuite (~22 dominios en producción). Cualquier agente o desarrollador debe seguir estrictamente estas directivas.

## 1. Datos del Servidor
- **Alias SSH:** `propodvps1` (`ssh propodvps1`)
- **IP:** `66.94.114.222` | **Puerto:** `2226` (NO es el 22)
- **Usuario:** `jose` (con permisos de `sudo`)
- **Llave SSH:** `~/.ssh/propodvps1_jose`
- **Sudo Pass:** `BvJhdx2S77NOv3Oqx62UwsX/`
- **Auditoría:** `/var/log/sudo-io`

## 2. Reglas de Oro de Arquitectura
1. **NO Docker, NO Docker Compose, NO Dokploy:** El servidor corre 100% con **Podman + Quadlet**.
2. **Estructura de Servicios:** 1 servicio = 1 archivo `/etc/containers/systemd/<servicio>.container` convertido en unit por systemd.
3. **Red & Reverse Proxy:** Se conecta a `prosuite.network` con etiquetas de Traefik v3.3 para enrutamiento y certificados SSL automáticos.
4. **Flujo de Aplicación de Cambios:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart <servicio>
   systemctl --failed
   sudo podman ps
   ```
<!-- END:propodvps1-operations-directive -->
