#!/bin/bash
# Script para instalar dependencias

echo "=== INSTALANDO DEPENDENCIAS ==="

# Instalar dependencias del backend
echo ""
echo "=== INSTALANDO DEPENDENCIAS DEL BACKEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/server
npm install

# Instalar dependencias del frontend
echo ""
echo "=== INSTALANDO DEPENDENCIAS DEL FRONTEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/client
npm install

echo ""
echo "=== INSTALACIÓN COMPLETADA ==="