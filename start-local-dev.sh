#!/bin/bash

echo "🚀 Iniciando Genea en modo desarrollo local..."
echo "📊 Base de datos: Supabase (remoto)"
echo "🖥️  Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""

# Función para manejar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar backend
echo "📡 Iniciando backend..."
cd genea-app/server
cp .env.local .env
npm install
npm run dev &
BACKEND_PID=$!

# Esperar a que el backend inicie
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd ../client
cp .env.local .env
npm install
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servidores iniciados:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:5000/api"
echo ""
echo "💡 Presiona Ctrl+C para detener ambos servidores"

# Esperar indefinidamente
wait