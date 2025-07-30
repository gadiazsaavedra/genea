#!/bin/bash
# Script para verificar que los controladores se han actualizado correctamente

echo "=== VERIFICACIÓN DE CONTROLADORES ACTUALIZADOS ==="

# Verificar controladores actualizados
echo ""
echo "=== VERIFICANDO CONTROLADORES ==="
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Verificar controlador de autenticación
if grep -q "supabaseAdmin" src/controllers/auth.controller.js; then
  echo "✅ Controlador de autenticación actualizado para usar Supabase"
else
  echo "❌ Controlador de autenticación NO actualizado para usar Supabase"
fi

# Verificar controlador de familias
if grep -q "supabaseClient" src/controllers/family.controller.js; then
  echo "✅ Controlador de familias actualizado para usar Supabase"
else
  echo "❌ Controlador de familias NO actualizado para usar Supabase"
fi

# Verificar controlador de personas
if grep -q "supabaseClient" src/controllers/person.controller.js; then
  echo "✅ Controlador de personas actualizado para usar Supabase"
else
  echo "❌ Controlador de personas NO actualizado para usar Supabase"
fi

# Verificar middleware de autenticación
if grep -q "supabaseAdmin" src/middleware/auth.middleware.js; then
  echo "✅ Middleware de autenticación actualizado para usar Supabase"
else
  echo "❌ Middleware de autenticación NO actualizado para usar Supabase"
fi

# Verificar servicio de autenticación
if grep -q "supabaseAdmin" src/services/auth.service.js; then
  echo "✅ Servicio de autenticación actualizado para usar Supabase"
else
  echo "❌ Servicio de autenticación NO actualizado para usar Supabase"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="