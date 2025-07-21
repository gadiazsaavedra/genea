#!/bin/bash

# Script para desplegar Genea en producción

echo "=== Preparando el backend para despliegue ==="
cd genea-app/server

# Instalar dependencias
echo "Instalando dependencias del backend..."
npm install

# Ejecutar pruebas
echo "Ejecutando pruebas del backend..."
npm test

# Preparar para producción
echo "Preparando el backend para producción..."
cp .env.production .env

echo "=== Preparando el frontend para despliegue ==="
cd ../client

# Instalar dependencias
echo "Instalando dependencias del frontend..."
npm install

# Construir para producción
echo "Construyendo el frontend para producción..."
npm run build

echo "=== Despliegue completado localmente ==="
echo "Para desplegar en Render.com y Vercel:"
echo "1. Sube el código a GitHub"
echo "2. Conecta tu repositorio en Render.com para el backend"
echo "3. Conecta tu repositorio en Vercel para el frontend"
echo "4. Configura las variables de entorno en Render.com según .env.production"
echo "5. Configura las variables de entorno en Vercel según .env.production"

cd ../..