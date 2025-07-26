#!/bin/bash

# Limpiar puertos
echo "🧹 Limpiando puertos..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

echo "🚀 Iniciando Genea LOCAL con DB Supabase"
echo "📊 Base de datos: Supabase (remoto)"
echo "🖥️  Backend: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""

# Función para cleanup
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT

# Backend
echo "📡 Iniciando backend..."
cd genea-app/server
cp .env.local .env
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

sleep 3

# Frontend  
echo "🎨 Iniciando frontend..."
cd ../client
cp .env.local .env
npm install > /dev/null 2>&1
PORT=3000 npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Genea LOCAL corriendo:"
echo "   🌐 App: http://localhost:3000"
echo "   📡 API: http://localhost:5001/api"
echo "   🗄️  DB: Supabase (remoto)"
echo ""
echo "💡 Presiona Ctrl+C para detener"

wait