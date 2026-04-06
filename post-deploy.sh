#!/bin/bash

# Post-deploy script para Hostinger
# Este script é executado automaticamente após cada deploy

echo "=== Post-Deploy Script ==="
echo "Timestamp: $(date)"

# Verificar se db.js existe e está vazio
if [ -f "src/db.js" ] && [ ! -s "src/db.js" ]; then
    echo "⚠️  db.js vazio detectado. Sincronizando do GitHub..."
    curl -s "https://raw.githubusercontent.com/viaagencia/crm-backend/master/src/db.js" > "src/db.js"
    echo "✓ db.js sincronizado"
    ls -lh "src/db.js"
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production não encontrado!"
    echo "Certifique-se de criar o arquivo .env.production manualmente"
fi

echo "=== Post-Deploy Completo ==="
