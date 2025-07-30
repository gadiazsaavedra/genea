#!/bin/bash
# Script para verificar la configuración de Supabase

echo "=== VERIFICACIÓN DE CONFIGURACIÓN DE SUPABASE ==="

# Verificar archivos de configuración del backend
echo ""
echo "=== VERIFICANDO BACKEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/server

if [ -f "src/config/supabase.config.js" ]; then
  echo "✅ Archivo de configuración de Supabase encontrado"
else
  echo "❌ Archivo de configuración de Supabase no encontrado"
fi

if [ -f ".env" ]; then
  echo "✅ Archivo .env encontrado"
  
  # Verificar variables de entorno críticas
  if grep -q "SUPABASE_URL" .env && grep -q "SUPABASE_ANON_KEY" .env && grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
    echo "✅ Variables de Supabase configuradas en .env"
  else
    echo "❌ Faltan variables de Supabase en .env"
  fi
else
  echo "❌ Archivo .env no encontrado"
fi

# Verificar archivos de configuración del frontend
echo ""
echo "=== VERIFICANDO FRONTEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/client

if [ -f "src/config/supabase.config.ts" ]; then
  echo "✅ Archivo de configuración de Supabase encontrado"
else
  echo "❌ Archivo de configuración de Supabase no encontrado"
fi

if [ -f ".env" ]; then
  echo "✅ Archivo .env encontrado"
  
  # Verificar variables de entorno críticas
  if grep -q "REACT_APP_SUPABASE_URL" .env && grep -q "REACT_APP_SUPABASE_ANON_KEY" .env; then
    echo "✅ Variables de Supabase configuradas en .env"
  else
    echo "❌ Faltan variables de Supabase en .env"
  fi
else
  echo "❌ Archivo .env no encontrado"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="