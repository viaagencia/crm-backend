# 🚀 CRM Backend API - Teeth to Success

API Node.js/Express para persistência de dados do CRM em banco de dados SQLite. Resolve o problema de múltiplos usuários em diferentes locais vendo dados diferentes.

## 🎯 O Problema que Resolve

**Antes (localStorage):**
```
Pessoa A cria atividade → só ela vê (no browser dela)
Pessoa B acessa de outro lugar → não vê nada
```

**Agora (com este backend):**
```
Pessoa A cria atividade → salva no banco de dados
Pessoa B acessa de outro lugar → vê a atividade em tempo real
Todos sempre veem o mesmo (sincronizado)
```

## 📋 O Que é Guardado?

- **Leads** - informações, origem, etapa do funil
- **Pacientes** - dados dos clientes convertidos
- **Atividades** - ligações, mensagens, observações
- **Funis (Pipelines)** - estrutura dos funis e etapas
- **Tarefas** - tarefas atribuídas aos leads/pacientes
- **Anotações** - notas sobre leads/pacientes

## 🚀 Instalação Rápida (Hostinger + GitHub)

### 1. Enviar para GitHub

```bash
# Na pasta do backend
git init
git add .
git commit -m "Initial commit: CRM Backend"
git branch -M main
git remote add origin https://github.com/seu-usuario/crm-backend.git
git push -u origin main
```

### 2. Deploy na Hostinger

1. Acesse sua conta Hostinger
2. Vá para **Hospedagem → Gerenciar → Aplicações**
3. Clique em **Criar Aplicação** ou **Deploy**
4. Escolha **Node.js**
5. Conecte seu repositório GitHub
6. Configure:
   - **Repository:** seu-usuario/crm-backend
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Port:** 3000

7. Na aba **Variáveis de Ambiente**, adicione:
```
PORT=3000
NODE_ENV=production
DB_PATH=/home/seu-usuario/applications/crm-backend/data/crm.db
CORS_ORIGIN=https://darkturquoise-cheetah-455837.hostingersite.com
```

8. Clique em **Deploy**

### 3. Testar

Acesse: `https://api.seu-dominio.com/api/health`

Deve retornar:
```json
{"status":"ok","timestamp":"2026-04-05T..."}
```

## 📝 Endpoints da API

### Leads
```
GET    /api/leads              # Listar todos
POST   /api/leads              # Criar novo
GET    /api/leads/:id          # Obter um
PUT    /api/leads/:id          # Atualizar
DELETE /api/leads/:id          # Deletar
```

### Pacientes
```
GET    /api/pacientes          # Listar todos
POST   /api/pacientes          # Criar novo
GET    /api/pacientes/:id      # Obter um
PUT    /api/pacientes/:id      # Atualizar
DELETE /api/pacientes/:id      # Deletar
```

### Atividades
```
GET    /api/atividades         # Listar todas
POST   /api/atividades         # Criar nova
PUT    /api/atividades/:id     # Atualizar
DELETE /api/atividades/:id     # Deletar
```

### Funis (Pipelines)
```
GET    /api/funis              # Listar todos com etapas
POST   /api/funis              # Criar novo
PUT    /api/funis/:id          # Atualizar
DELETE /api/funis/:id          # Deletar

POST   /api/funis/:id/etapas           # Adicionar etapa
PUT    /api/funis/:funilId/etapas/:etapaId  # Atualizar etapa
DELETE /api/funis/:funilId/etapas/:etapaId  # Deletar etapa
```

### Tarefas
```
GET    /api/tarefas            # Listar todas
POST   /api/tarefas            # Criar nova
PUT    /api/tarefas/:id        # Atualizar
DELETE /api/tarefas/:id        # Deletar
```

### Anotações
```
GET    /api/anotacoes          # Listar todas
POST   /api/anotacoes          # Criar nova
PUT    /api/anotacoes/:id      # Atualizar
DELETE /api/anotacoes/:id      # Deletar
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (com hot reload)
npm run dev

# Rodar em modo produção
npm start
```

API estará em `http://localhost:3000`

## 🔄 Próximas Etapas (Integração com CRM)

Veja o arquivo `INTEGRACAO_CRM.md` para instruções detalhadas de como conectar o CRM React a este backend.

**Resumo rápido:**
1. Criar `src/config/api.ts` no CRM
2. Atualizar `.env.local` com URL da API
3. Modificar `useCrmData.ts` para chamar a API
4. Testar sincronização

## 📊 Estrutura do Banco de Dados

SQLite com 8 tabelas:
- `leads` - contatos de interesse
- `pacientes` - clientes confirmados
- `atividades` - histórico de interações
- `funis` - estrutura dos pipelines
- `etapas` - estágios de cada funil
- `tarefas` - tarefas atribuídas
- `anotacoes` - notas sobre contatos
- `telefones_apagados` - blacklist de deletados

## 🔐 Segurança

- `.env` **nunca** entra no GitHub (está no `.gitignore`)
- Variáveis sensíveis configuradas na Hostinger
- Banco de dados local na VPS

## 📌 Notas Importantes

1. **SQLite** - Arquivo único (`crm.db`), fácil de fazer backup
2. **CORS** - Configurado para o seu domínio Hostinger
3. **Escalabilidade** - Se crescer muito, migrar para PostgreSQL é bem fácil
4. **Backup** - Baixe `data/crm.db` regularmente da Hostinger

## 🚨 Troubleshooting

**"API não responde"**
- Verifique se o repositório foi clonado corretamente
- Confirme se as variáveis de ambiente estão salvas
- Tente fazer redeploy na Hostinger

**"Erro de conexão com banco"**
- Verifique se a pasta `data/` existe
- Confirme se `DB_PATH` está correto nas variáveis

**"CORS error"**
- Adicione sua URL à variável `CORS_ORIGIN` na Hostinger
- Separar múltiplas URLs com vírgula: `https://site1.com,https://site2.com`

## 📚 Documentação Complementar

- `INTEGRACAO_CRM.md` - Como conectar o CRM React
- `GUIA_ALTERACOES.md` - Como fazer mudanças no código
- `package.json` - Dependências do projeto
