#!/bin/bash

echo "🚀 Iniciando backend de Genea..."

cd genea-app/server

# Copiar configuración local
cp .env.local .env

# Instalar dependencias si es necesario
npm install

# Iniciar servidor
echo "📡 Backend iniciando en http://localhost:5001"
npm run dev