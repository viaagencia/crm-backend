# 🛠️ Guia de Alterações - Como Mexer no Backend

Documento para facilitar que você (ou alguém da equipe) faça alterações no código sem quebrar nada.

## 📁 Estrutura de Pastas

```
crm-backend/
├── src/
│   ├── server.js          ← Arquivo principal do servidor
│   ├── db.js              ← Configuração do banco de dados
│   └── routes/
│       ├── leads.js       ← Operações de leads
│       ├── pacientes.js   ← Operações de pacientes
│       ├── atividades.js  ← Operações de atividades
│       ├── funis.js       ← Operações de funis e etapas
│       ├── tarefas.js     ← Operações de tarefas
│       └── anotacoes.js   ← Operações de anotações
├── package.json           ← Dependências
├── .env.example           ← Exemplo de variáveis (commitar isso)
├── .env                   ← Variáveis reais (NUNCA commitar)
├── .gitignore             ← Arquivos ignorados no Git
└── README.md              ← Este documento
```

## 🔄 Fluxo de Desenvolvimento

### 1. Fazer uma alteração

```bash
# Editar qualquer arquivo em src/
# Exemplo: adicionar um novo campo a leads

# server.js já está monitorando mudanças (hot reload)
# A API reinicia automaticamente
```

### 2. Testar localmente

```bash
# Terminal 1: rodar o backend
npm run dev

# Terminal 2: testar com curl
curl http://localhost:3000/api/health

# Ou use Postman/Insomnia para testar os endpoints
```

### 3. Enviar para GitHub

```bash
git add .
git commit -m "Descrição clara da mudança"
git push origin main
```

### 4. Deploy automático

A Hostinger fará redeploy automaticamente quando você fizer push para `main`.

## 📝 Exemplos de Alterações Comuns

### ✅ Adicionar um novo campo a Leads

**Passo 1:** Alterar a tabela no `src/db.js`

```javascript
// Em initDatabase(), adicionar coluna à tabela leads:
db.run(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL UNIQUE,
    email TEXT,
    origem TEXT,
    etapa TEXT DEFAULT 'Novo',
    renda TEXT,              // ← NOVO CAMPO
    profissao TEXT,          // ← NOVO CAMPO
    criadoEm TEXT NOT NULL,
    atualizadoEm TEXT NOT NULL,
    sincronizadoComPlanilha INTEGER DEFAULT 0
  )
`);
```

**Passo 2:** Atualizar a rota de criação em `src/routes/leads.js`

```javascript
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, origem, etapa, renda, profissao } = req.body;

    // ... validação ...

    await dbRun(
      `INSERT INTO leads (id, nome, telefone, email, origem, etapa, renda, profissao, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nome, telefone, email || '', origem || 'Direto', etapa || 'Novo', renda || '', profissao || '', agora, agora]
    );
    // ...
  }
});
```

**Passo 3:** Atualizar a rota de atualização em `src/routes/leads.js`

```javascript
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, origem, etapa, renda, profissao } = req.body;
    // ...
    if (renda !== undefined) {
      updates.push('renda = ?');
      values.push(renda);
    }
    if (profissao !== undefined) {
      updates.push('profissao = ?');
      values.push(profissao);
    }
    // ... rest do código ...
  }
});
```

**Passo 4:** Testar

```bash
# Criar um novo lead COM os novos campos
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "telefone": "11999999999",
    "renda": "10000",
    "profissao": "Dentista"
  }'
```

**Passo 5:** Enviar para GitHub

```bash
git add .
git commit -m "Adicionar campos renda e profissao aos leads"
git push
```

---

### ✅ Criar uma nova tabela (ex: Orçamentos)

**Passo 1:** Adicionar a tabela em `src/db.js`

```javascript
function initDatabase() {
  db.serialize(() => {
    // ... outras tabelas ...

    // Tabela de Orçamentos
    db.run(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id TEXT PRIMARY KEY,
        pacienteId TEXT NOT NULL,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        status TEXT DEFAULT 'pendente',
        criadoEm TEXT NOT NULL,
        atualizadoEm TEXT NOT NULL,
        FOREIGN KEY(pacienteId) REFERENCES pacientes(id) ON DELETE CASCADE
      )
    `);

    console.log('✓ Tabelas inicializadas com sucesso');
  });
}
```

**Passo 2:** Criar novo arquivo `src/routes/orcamentos.js`

```javascript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todos os orçamentos
router.get('/', async (req, res) => {
  try {
    const orcamentos = await dbAll('SELECT * FROM orcamentos ORDER BY criadoEm DESC');
    res.json(orcamentos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET orçamentos de um paciente
router.get('/paciente/:pacienteId', async (req, res) => {
  try {
    const orcamentos = await dbAll(
      'SELECT * FROM orcamentos WHERE pacienteId = ? ORDER BY criadoEm DESC',
      [req.params.pacienteId]
    );
    res.json(orcamentos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar novo orçamento
router.post('/', async (req, res) => {
  try {
    const { pacienteId, descricao, valor } = req.body;

    if (!pacienteId || !descricao || !valor) {
      return res.status(400).json({ erro: 'pacienteId, descricao e valor são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO orcamentos (id, pacienteId, descricao, valor, status, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, pacienteId, descricao, valor, 'pendente', agora, agora]
    );

    const orcamento = await dbGet('SELECT * FROM orcamentos WHERE id = ?', [id]);
    res.status(201).json(orcamento);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar orçamento
router.put('/:id', async (req, res) => {
  try {
    const { descricao, valor, status } = req.body;
    const agora = new Date().toISOString();

    const updates = [];
    const values = [];

    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }
    if (valor !== undefined) {
      updates.push('valor = ?');
      values.push(valor);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    updates.push('atualizadoEm = ?');
    values.push(agora);
    values.push(req.params.id);

    await dbRun(
      `UPDATE orcamentos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const orcamento = await dbGet('SELECT * FROM orcamentos WHERE id = ?', [req.params.id]);
    res.json(orcamento);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE orçamento
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM orcamentos WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Orçamento excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
```

**Passo 3:** Registrar a rota em `src/server.js`

```javascript
import orcamentosRoutes from './routes/orcamentos.js';

// ... após as outras rotas ...
app.use('/api/orcamentos', orcamentosRoutes);
```

**Passo 4:** Enviar para GitHub

```bash
git add .
git commit -m "Adicionar modelo de Orçamentos com endpoints"
git push
```

---

## 🚨 Erros Comuns e Como Corrigir

### ❌ "TypeError: dbRun is not a function"

**Causa:** Faltou importar do `db.js`

**Solução:** Adicione no topo do arquivo:
```javascript
import { dbRun, dbGet, dbAll } from '../db.js';
```

### ❌ "UNIQUE constraint failed"

**Causa:** Tentou inserir um telefone que já existe

**Solução:** Antes de inserir, valide se não existe:
```javascript
const existe = await dbGet('SELECT id FROM leads WHERE telefone = ?', [telefone]);
if (existe) {
  return res.status(400).json({ erro: 'Telefone já cadastrado' });
}
```

### ❌ "Cannot find module 'express'"

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
```

### ❌ API não responde após mudança

**Causa:** Erro de sintaxe no JavaScript

**Solução:**
```bash
# Verifique os logs no console
# Procure por mensagens de erro
# Corrija e salve o arquivo (hot reload reinicia)
```

---

## 📋 Boas Práticas

### ✅ DO (Faça assim)

```javascript
// Validar entrada
if (!nome || !telefone) {
  return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
}

// Usar try/catch
try {
  const result = await dbRun(sql, params);
  res.json(result);
} catch (err) {
  res.status(500).json({ erro: err.message });
}

// Retornar dados estruturados
res.status(201).json({ id, nome, createdAt });

// Usar timestamps ISO
const agora = new Date().toISOString();
```

### ❌ DON'T (Não faça assim)

```javascript
// Não validar entrada
const { nome } = req.body;
await dbRun(`INSERT INTO leads (nome) VALUES (?)`, [nome]);

// Não usar try/catch
const result = await dbRun(sql); // Pode quebrar se falhar

// Não retornar apenas status
res.status(200); // Sem dados

// Não usar timestamps em formato estranho
const data = new Date().toString(); // Formato diferente cada vez
```

---

## 📞 Precisa de Ajuda?

1. **Erro na API?** → Verifique os logs do console
2. **Banco de dados corrompido?** → Delete `data/crm.db` e reinicie
3. **Não sabe como fazer algo?** → Copie o padrão de outro arquivo
4. **Quer adicionar um novo campo?** → Siga o exemplo de "Adicionar campo a Leads"

Boa sorte! 🚀

