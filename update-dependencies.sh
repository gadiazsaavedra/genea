#!/bin/bash
# Script principal para verificar dependencias

echo "=== VERIFICACIÓN DE DEPENDENCIAS PARA SUPABASE ==="

# Verificar backend
echo ""
echo "=== VERIFICANDO BACKEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Verificar si Supabase está instalado
if npm list @supabase/supabase-js | grep -q "@supabase/supabase-js"; then
  echo "✅ Supabase ya está instalado en el backend"
else
  echo "❌ Supabase no está instalado en el backend"
  echo "Instalando Supabase..."
  npm install @supabase/supabase-js
fi

# Verificar si las dependencias antiguas están desinstaladas
if npm list mongoose | grep -q "mongoose@"; then
  echo "❌ MongoDB todavía está instalado"
  echo "Desinstalando MongoDB..."
  npm uninstall mongoose
else
  echo "✅ MongoDB ya está desinstalado"
fi

if npm list firebase-admin | grep -q "firebase-admin@"; then
  echo "❌ Firebase Admin todavía está instalado"
  echo "Desinstalando Firebase Admin..."
  npm uninstall firebase-admin
else
  echo "✅ Firebase Admin ya está desinstalado"
fi

# Verificar frontend
echo ""
echo "=== VERIFICANDO FRONTEND ==="
cd /home/gustavo/Documents/dev/genea/genea-app/client

# Verificar si Supabase está instalado
if npm list @supabase/supabase-js | grep -q "@supabase/supabase-js"; then
  echo "✅ Supabase ya está instalado en el frontend"
else
  echo "❌ Supabase no está instalado en el frontend"
  echo "Instalando Supabase..."
  npm install @supabase/supabase-js
fi

# Verificar si Firebase está desinstalado
if npm list firebase | grep -q "firebase@"; then
  echo "❌ Firebase todavía está instalado"
  echo "Desinstalando Firebase..."
  npm uninstall firebase
else
  echo "✅ Firebase ya está desinstalado"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="
echo "Las dependencias están correctamente configuradas para usar Supabase."
echo "Ahora puedes implementar los archivos de configuración y controladores."