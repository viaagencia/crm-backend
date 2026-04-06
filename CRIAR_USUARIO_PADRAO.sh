#!/bin/bash

# Script para criar o usuário padrão
# Uso: ./CRIAR_USUARIO_PADRAO.sh

echo "🔐 Criando usuário padrão..."
echo ""

# Email padrão
EMAIL="via.agencia2025@gmail.com"
SENHA="@Via2025"
NOME="Via"

# URL da API
API_URL="${1:-http://localhost:3000}"

echo "📧 Email: $EMAIL"
echo "🔑 Senha: $SENHA"
echo "👤 Nome: $NOME"
echo "🌐 API: $API_URL"
echo ""

# Fazer request
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/criar-usuario" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"senha\": \"$SENHA\",
    \"nome\": \"$NOME\"
  }")

echo "✓ Resposta:"
echo "$RESPONSE" | jq '.'

echo ""
echo "✓ Usuário criado com sucesso!"
echo ""
echo "Próximas etapas:"
echo "1. Fazer login com:"
echo "   Email: $EMAIL"
echo "   Senha: $SENHA"
echo ""
echo "2. Usar o token retornado em todas as requisições"
echo ""
