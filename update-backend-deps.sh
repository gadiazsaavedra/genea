#!/bin/bash
# Script para actualizar dependencias del backend

echo "Actualizando dependencias del backend..."
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Desinstalar dependencias antiguas
echo "Desinstalando MongoDB y Firebase..."
npm uninstall mongoose firebase-admin

# Instalar Supabase
echo "Instalando Supabase..."
npm install @supabase/supabase-js

# Instalar otras dependencias que podrían ser necesarias
echo "Instalando dependencias adicionales..."
npm install jsonwebtoken

echo "Actualización de dependencias del backend completada."