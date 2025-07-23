#!/bin/bash
# Script para actualizar dependencias del frontend

echo "Actualizando dependencias del frontend..."
cd /home/gustavo/Documents/dev/genea/genea-app/client

# Desinstalar dependencias antiguas
echo "Desinstalando Firebase..."
npm uninstall firebase

# Instalar Supabase
echo "Instalando Supabase..."
npm install @supabase/supabase-js

echo "Actualización de dependencias del frontend completada."