#!/bin/bash
# Script para iniciar la aplicación

echo "=== INICIANDO APLICACIÓN ==="

# Verificar si tmux está instalado
if ! command -v tmux &> /dev/null; then
    echo "tmux no está instalado. Instalando..."
    sudo apt-get update && sudo apt-get install -y tmux
fi

# Crear una nueva sesión de tmux
tmux new-session -d -s genea

# Dividir la ventana en dos paneles
tmux split-window -h -t genea

# Panel izquierdo: Backend
tmux send-keys -t genea:0.0 "cd /home/gustavo/Documents/dev/genea/genea-app/server && echo 'Iniciando backend...' && npm run dev" C-m

# Panel derecho: Frontend
tmux send-keys -t genea:0.1 "cd /home/gustavo/Documents/dev/genea/genea-app/client && echo 'Iniciando frontend...' && npm start" C-m

# Adjuntar a la sesión
tmux attach-session -t genea

echo ""
echo "=== APLICACIÓN INICIADA ==="
echo "Para salir de tmux: presiona Ctrl+B, luego D"
echo "Para volver a la sesión: ejecuta 'tmux attach-session -t genea'"