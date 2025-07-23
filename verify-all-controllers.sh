#!/bin/bash
# Script para verificar que todos los controladores se han actualizado correctamente

echo "=== VERIFICACIÓN DE TODOS LOS CONTROLADORES ==="

# Verificar controladores actualizados
echo ""
echo "=== VERIFICANDO CONTROLADORES ==="
cd /home/gustavo/Documents/dev/genea/genea-app/server

# Lista de controladores a verificar
controllers=(
  "auth.controller.js"
  "family.controller.js"
  "person.controller.js"
  "media.controller.js"
  "comment.controller.js"
  "notification.controller.js"
  "invitation.controller.js"
  "stats.controller.js"
  "timeline.controller.js"
  "gedcom.controller.js"
)

# Verificar cada controlador
for controller in "${controllers[@]}"; do
  if grep -q "supabase" "src/controllers/$controller"; then
    echo "✅ $controller actualizado para usar Supabase"
  else
    echo "❌ $controller NO actualizado para usar Supabase"
  fi
done

# Verificar middleware de autenticación
if grep -q "supabase" src/middleware/auth.middleware.js; then
  echo "✅ Middleware de autenticación actualizado para usar Supabase"
else
  echo "❌ Middleware de autenticación NO actualizado para usar Supabase"
fi

# Verificar servicio de autenticación
if grep -q "supabase" src/services/auth.service.js; then
  echo "✅ Servicio de autenticación actualizado para usar Supabase"
else
  echo "❌ Servicio de autenticación NO actualizado para usar Supabase"
fi

# Verificar servicio de almacenamiento
if grep -q "supabase" src/services/storage.service.js; then
  echo "✅ Servicio de almacenamiento actualizado para usar Supabase"
else
  echo "❌ Servicio de almacenamiento NO actualizado para usar Supabase"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="