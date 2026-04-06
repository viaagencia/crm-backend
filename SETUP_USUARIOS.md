# 👤 Configuração de Usuários - CRM Backend

Este documento explica como criar e gerenciar usuários no sistema.

## 🚀 Primeiro Usuário (Você)

### Via Postman/Insomnia

1. **POST** `http://localhost:3000/api/auth/criar-usuario`
2. **Headers:** `Content-Type: application/json`
3. **Body:**
```json
{
  "email": "via.agencia2025@gmail.com",
  "senha": "@Via2025",
  "nome": "Via"
}
```

**Resposta (sucesso):**
```json
{
  "id": "uuid-aqui",
  "email": "via.agencia2025@gmail.com",
  "nome": "Via",
  "criadoEm": "2026-04-05T..."
}
```

### Via cURL (terminal)

```bash
curl -X POST http://localhost:3000/api/auth/criar-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "email": "via.agencia2025@gmail.com",
    "senha": "@Via2025",
    "nome": "Via"
  }'
```

---

## 🔐 Login

Depois de criar o usuário, você faz login para obter o token:

### Via Postman/Insomnia

1. **POST** `http://localhost:3000/api/auth/login`
2. **Headers:** `Content-Type: application/json`
3. **Body:**
```json
{
  "email": "via.agencia2025@gmail.com",
  "senha": "@Via2025"
}
```

**Resposta (sucesso):**
```json
{
  "token": "dXV1aWQtYXF1aS1lbmNvZGFkbyW5tZXM=",
  "usuario": {
    "id": "uuid-aqui",
    "email": "via.agencia2025@gmail.com",
    "nome": "Via"
  }
}
```

---

## 📝 Usar o Token em Requisições

Depois de fazer login, use o token em todas as requisições autenticadas:

### Headers Necessários:
```
Authorization: Bearer dXV1aWQtYXF1aWktZW5jb2RhZG8=
Content-Type: application/json
```

### Exemplo: Criar um Lead

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer dXV1aWQtYXF1aWktZW5jb2RhZG8=" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "telefone": "11999999999",
    "email": "joao@email.com",
    "origem": "Google"
  }'
```

---

## 👥 Adicionar Mais Usuários

Qualquer pessoa (sem autenticação) pode se cadastrar:

```bash
curl -X POST http://localhost:3000/api/auth/criar-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@email.com",
    "senha": "SenhaForte123!",
    "nome": "Novo Usuário"
  }'
```

---

## 🔑 Endpoints de Autenticação

| Método | Endpoint | Auth? | Descrição |
|--------|----------|-------|-----------|
| POST | `/api/auth/criar-usuario` | ❌ | Criar novo usuário |
| POST | `/api/auth/login` | ❌ | Fazer login e obter token |
| GET | `/api/auth/me` | ✅ | Dados do usuário autenticado |
| PUT | `/api/auth/mudar-senha` | ✅ | Alterar senha do usuário |

---

## 🛠️ Mudar Senha

```bash
curl -X PUT http://localhost:3000/api/auth/mudar-senha \
  -H "Authorization: Bearer dXV1aWQtYXF1aWktZW5jb2RhZG8=" \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "@Via2025",
    "novaSenha": "@Via2026"
  }'
```

---

## 📊 Dados Salvos Por Usuário

Agora cada usuário tem dados **completamente isolados**:

```
Usuário A
├── Leads dele (20)
├── Pacientes dele (5)
├── Atividades dele (100)
├── Funis dele (2)
└── Tarefas dele (30)

Usuário B (completamente separado)
├── Leads dele (8)
├── Pacientes dele (3)
├── Atividades dele (15)
├── Funis dele (1)
└── Tarefas dele (5)
```

Se Usuário A fizer login, **só verá seus dados**. Se Usuário B fizer login, **só verá seus dados**.

---

## ⚠️ Notas Importantes

1. **Senhas são hasheadas** com SHA-256 (em produção, use bcrypt)
2. **Tokens são codificados em Base64** (em produção, use JWT)
3. **Cada lead/atividade/etc pertence a um usuário** via `usuarioId`
4. **Dados de usuários diferentes são isolados** (UNIQUE constraints garantem)

---

## 🚀 Próximas Etapas

Depois de atualizar o código:

1. Fazer push no GitHub
2. Redeploy na Hostinger
3. Integrar no CRM React (adicionar login na interface)
4. Usar o token em todas as chamadas de API

Quer que eu prepare o código React para fazer login? 👀

