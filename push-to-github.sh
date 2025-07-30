#!/bin/bash

echo "🚀 Subiendo cambios a GitHub..."

# Agregar todos los archivos
git add .

# Crear commit con timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Actualizaciones del $TIMESTAMP

- Corregidas dependencias faltantes (leaflet, react-leaflet)
- Solucionado problema de consulta SQL en personas
- Agregadas traducciones en portugués para Dashboard
- Corregido controlador de actualización de personas
- Mejorado RelationshipManager con familyId correcto
- Agregado sistema de debug para i18n
- Scripts de ejecución local (run-genea.sh)
"

# Subir a GitHub
git push origin main

echo "✅ Cambios subidos exitosamente!"
echo "📋 Para continuar mañana:"
echo "   1. git pull origin main"
echo "   2. ./run-genea.sh"
echo "   3. Continuar con las traducciones de i18n"