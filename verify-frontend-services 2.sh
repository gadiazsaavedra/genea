#!/bin/bash
# Script para verificar que todos los servicios del frontend se han actualizado correctamente

echo "=== VERIFICACIÓN DE SERVICIOS DEL FRONTEND ==="

# Verificar servicios actualizados
echo ""
echo "=== VERIFICANDO SERVICIOS ==="
cd /home/gustavo/Documents/dev/genea/genea-app/client

# Lista de servicios a verificar
services=(
  "api.js"
  "authService.js"
  "familyService.js"
  "personService.js"
  "mediaService.js"
  "commentService.js"
  "notificationService.js"
  "invitationService.js"
)

# Verificar cada servicio
for service in "${services[@]}"; do
  if [ -f "src/services/$service" ]; then
    if grep -q "supabase" "src/services/$service"; then
      echo "✅ $service actualizado para usar Supabase"
    else
      echo "⚠️ $service existe pero no usa Supabase directamente"
    fi
  else
    echo "❌ $service no existe"
  fi
done

# Verificar archivo de índice
if [ -f "src/services/index.js" ]; then
  echo "✅ Archivo de índice de servicios creado"
else
  echo "❌ Archivo de índice de servicios no existe"
fi

# Verificar configuración de Supabase
if [ -f "src/config/supabase.config.ts" ]; then
  echo "✅ Configuración de Supabase creada"
else
  echo "❌ Configuración de Supabase no existe"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="