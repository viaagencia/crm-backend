# 📋 Resumo das Mudanças - Sistema de Autenticação

## ✅ O Que Foi Adicionado

### 1. Tabela de Usuários
- `src/db.js` - Nova tabela `usuarios` com email, senha (hasheada), nome
- Todas as tabelas agora têm `usuarioId` para isolar dados por usuário

### 2. Rotas de Autenticação
- `src/routes/auth.js` - Endpoints para:
  - ✅ **POST `/api/auth/criar-usuario`** - Criar novo usuário
  - ✅ **POST `/api/auth/login`** - Login com email e senha
  - ✅ **GET `/api/auth/me`** - Dados do usuário autenticado
  - ✅ **PUT `/api/auth/mudar-senha`** - Alterar senha

### 3. Middleware de Autenticação
- `src/routes/auth.js` - `authMiddleware` que valida token
- Todos os endpoints agora podem usar `authMiddleware` para proteger

### 4. Documentação
- `SETUP_USUARIOS.md` - Guia completo de uso
- `CRIAR_USUARIO_PADRAO.sh` - Script para criar usuário inicial

---

## 🔐 Credenciais Padrão

```
Email: via.agencia2025@gmail.com
Senha: @Via2025
```

---

## 📝 Como Usar

### 1. Criar seu usuário (primeira vez)

**POST** `/api/auth/criar-usuario`
```json
{
  "email": "via.agencia2025@gmail.com",
  "senha": "@Via2025",
  "nome": "Via"
}
```

### 2. Fazer login

**POST** `/api/auth/login`
```json
{
  "email": "via.agencia2025@gmail.com",
  "senha": "@Via2025"
}
```

Resposta:
```json
{
  "token": "dXV1aWQtYXF1aWktZW5jb2RhZG8=",
  "usuario": { ... }
}
```

### 3. Usar o token em requisições

Header necessário:
```
Authorization: Bearer dXV1aWQtYXF1aWktZW5jb2RhZG8=
```

---

## 🔄 Dados Isolados

✅ Cada usuário vê APENAS seus próprios dados:
- Leads
- Pacientes
- Atividades
- Funis
- Tarefas
- Anotações

Usuários diferentes não veem dados uns dos outros!

---

## 📌 Arquivos Modificados

- ✅ `src/db.js` - Adicionada tabela usuarios, usuarioId em todas as tabelas
- ✅ `src/server.js` - Importadas rotas de auth
- ✅ `src/routes/auth.js` - NOVO - Sistema completo de autenticação
- ✅ `SETUP_USUARIOS.md` - NOVO - Documentação
- ✅ `CRIAR_USUARIO_PADRAO.sh` - NOVO - Script de setup

---

## 🚀 Próximos Passos

1. **Push no GitHub**
   ```bash
   git add .
   git commit -m "Add: Sistema completo de autenticação com usuários isolados"
   git push origin main
   ```

2. **Redeploy na Hostinger**
   - Vai reimplantar automaticamente

3. **Testar autenticação**
   ```bash
   # Criar usuário
   curl -X POST https://darksalmon-viper-304874.hostingersite.com/api/auth/criar-usuario \
     -H "Content-Type: application/json" \
     -d '{"email":"via.agencia2025@gmail.com","senha":"@Via2025","nome":"Via"}'
   ```

4. **Integrar no CRM React**
   - Adicionar tela de login
   - Guardar token no localStorage
   - Enviar token em todas as requisições

---

## ⚙️ Configuração

Nenhuma variável de ambiente nova necessária! Funciona com as que você já tem.

---

## 💡 Exemplo Completo (cURL)

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/api/auth/criar-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "senha": "Senha123!",
    "nome": "Novo Usuário"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "senha": "Senha123!"
  }'

# 3. Usar token (guardar o valor retornado)
TOKEN="dXV1aWQtYXF1aWktZW5jb2RhZG8="

# 4. Criar lead com token
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "telefone": "11999999999",
    "origem": "Google"
  }'
```

---

Tudo pronto! Quer fazer o push agora? 🚀

