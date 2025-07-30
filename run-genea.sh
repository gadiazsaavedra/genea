#!/bin/bash

# Script para ejecutar Genea localmente
echo "🚀 Iniciando Genea..."

# Matar procesos existentes
echo "🔄 Deteniendo procesos existentes..."
pkill -f "node src/index.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

# Esperar un momento
sleep 2

# Iniciar backend
echo "⚙️  Iniciando backend..."
cd genea-app/server
npm run dev > ../../backend.log 2>&1 &
BACKEND_PID=$!

# Esperar que el backend inicie
sleep 5

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd ../client
npm start > ../../frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar que el frontend inicie
sleep 10

# Volver al directorio raíz
cd ../..

echo "✅ Genea iniciado!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "🌐 Abriendo navegador..."
open http://localhost:3000
echo ""
echo "📋 Para ver logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para detener: pkill -f 'node src/index.js' && pkill -f 'react-scripts start'"