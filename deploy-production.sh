#!/bin/bash

echo "🚀 Desplegando Genea a PRODUCCIÓN"
echo ""

# Verificar que estamos en el branch correcto
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "deploy-to-supabase" ]; then
    echo "❌ Debes estar en el branch 'deploy-to-supabase'"
    echo "   Ejecuta: git checkout deploy-to-supabase"
    exit 1
fi

# Verificar que no hay cambios sin commit
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Hay cambios sin commit"
    echo "   Ejecuta: git add . && git commit -m 'mensaje'"
    exit 1
fi

echo "✅ Verificaciones pasadas"
echo ""

# Push a GitHub
echo "📤 Subiendo cambios a GitHub..."
git push origin deploy-to-supabase

echo ""
echo "🎯 URLs de producción:"
echo "   🌐 Frontend: https://geneal.netlify.app"
echo "   📡 Backend: https://genea-backend.onrender.com"
echo ""
echo "⏳ Netlify y Render se actualizarán automáticamente en ~2-3 minutos"
echo ""
echo "✅ Deploy iniciado correctamente"