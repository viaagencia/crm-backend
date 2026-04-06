# 🔗 Configuração Frontend ↔ Backend

Este documento explica como conectar o CRM React (Frontend) com a API Node.js (Backend).

## 🎯 URLs em Produção

```
Frontend (CRM React):  https://darkturquoise-cheetah-455837.hostingersite.com
Backend (API):         https://darksalmon-viper-304874.hostingersite.com
```

**Importante:** O Frontend PRECISA saber onde está o Backend!

---

## 📝 Configuração no CRM React

No projeto React, você precisa criar um arquivo `.env.local`:

```bash
# .env.local (NÃO entra no Git!)
VITE_API_URL=https://darksalmon-viper-304874.hostingersite.com
```

Ou se estiver em desenvolvimento local:

```bash
# .env.local (desenvolvimento)
VITE_API_URL=http://localhost:3000
```

---

## 💻 Arquivo de Configuração da API

Crie um arquivo `src/config/api.ts` no CRM React:

```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API = {
  auth: {
    login: () => `${API_BASE_URL}/api/auth/login`,
    criarUsuario: () => `${API_BASE_URL}/api/auth/criar-usuario`,
    me: () => `${API_BASE_URL}/api/auth/me`,
  },
  leads: {
    list: () => `${API_BASE_URL}/api/leads`,
    create: () => `${API_BASE_URL}/api/leads`,
    update: (id: string) => `${API_BASE_URL}/api/leads/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/leads/${id}`,
  },
  // ... etc
};
```

---

## 🔑 Token de Autenticação

Depois de fazer login, você recebe um token. **Guarde em localStorage:**

```typescript
// No componente de login
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
});

const { token } = await response.json();

// Guardar o token
localStorage.setItem('token', token);
```

---

## 📤 Usar Token em Requisições

Sempre inclua o token no header `Authorization`:

```typescript
const token = localStorage.getItem('token');

const response = await fetch(`${API_BASE_URL}/api/leads`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🛠️ Checklist de Integração

- [ ] Arquivo `.env.local` criado no CRM React
- [ ] `src/config/api.ts` criado
- [ ] Token sendo guardado após login
- [ ] Token sendo enviado em todas as requisições
- [ ] CORS permitindo requisições do Frontend (já configurado no Backend)
- [ ] CRM React testando login com a API de produção

---

## 🧪 Testar Conexão

```bash
# 1. Verificar se Backend está online
curl https://darksalmon-viper-304874.hostingersite.com/api/health

# 2. Criar usuário
curl -X POST https://darksalmon-viper-304874.hostingersite.com/api/auth/criar-usuario \
  -H "Content-Type: application/json" \
  -d '{"email":"via.agencia2025@gmail.com","senha":"@Via2025","nome":"Via"}'

# 3. Fazer login
curl -X POST https://darksalmon-viper-304874.hostingersite.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"via.agencia2025@gmail.com","senha":"@Via2025"}'
```

---

## ⚠️ Problemas Comuns

### CORS Error
**Causa:** Frontend tentando acessar Backend de domínio diferente
**Solução:** Backend já tem CORS configurado. Se não funcionar, adicionar domínio em `CORS_ORIGIN`

### 401 Unauthorized
**Causa:** Token faltando ou inválido
**Solução:** Verificar se token está no localStorage e sendo enviado no header

### 503 Service Unavailable
**Causa:** Backend não está rodando
**Solução:** Verificar se Hostinger reimplantou corretamente (clicar em Redeploy)

---

## 📊 Fluxo de Autenticação

```
1. Usuário entra email/senha
   ↓
2. Frontend envia POST /api/auth/login
   ↓
3. Backend valida e retorna token
   ↓
4. Frontend guarda token em localStorage
   ↓
5. Frontend envia token em Authorization header
   ↓
6. Backend valida token e retorna dados
```

---

Pronto! Com essa configuração, o Frontend e Backend vão funcionar perfeitamente em produção! 🚀

