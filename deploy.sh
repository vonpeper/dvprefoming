#!/bin/bash
set -e

echo "🚀 Desplegando DV Performing Arts en prev.dvperformingarts.com..."

# 1. Asegurar última versión del repositorio
echo "📥 Actualizando código..."
git pull origin master

# 2. Reconstruir y levantar contenedor Docker
echo "🐳 Construyendo y levantando contenedor..."
docker compose up -d --build --force-recreate

# 3. Limpiar imágenes no utilizadas
echo "🧹 Limpiando imágenes obsoletas..."
docker image prune -f

echo "🟢 Despliegue finalizado exitosamente en https://prev.dvperformingarts.com"
