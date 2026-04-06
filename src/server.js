const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'u891142242_crm',
  password: 'CrmVia@2025!',
  database: 'u891142242_crm',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // Tabela de Funis
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS funnels (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Leads
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(50),
        funnel_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Pacientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id VARCHAR(36) PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(50),
        coluna_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Tarefas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id VARCHAR(36) PRIMARY KEY,
        titulo VARCHAR(255),
        descricao TEXT,
        status VARCHAR(50),
        tipo VARCHAR(50),
        lead_id VARCHAR(36),
        paciente_id VARCHAR(36),
        data_vencimento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Atividades
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS atividades (
        id VARCHAR(36) PRIMARY KEY,
        tipo VARCHAR(50),
        descricao TEXT,
        status VARCHAR(50),
        observacao TEXT,
        lead_id VARCHAR(36),
        paciente_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Agendamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id VARCHAR(36) PRIMARY KEY,
        titulo VARCHAR(255),
        data_hora DATETIME,
        local VARCHAR(255),
        lead_id VARCHAR(36),
        paciente_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Anotações
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS anotacoes (
        id VARCHAR(36) PRIMARY KEY,
        texto TEXT,
        lead_id VARCHAR(36),
        paciente_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Orçamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id VARCHAR(36) PRIMARY KEY,
        titulo VARCHAR(255),
        valor DECIMAL(10, 2),
        status VARCHAR(50),
        lead_id VARCHAR(36),
        paciente_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de Estado CRM (armazena JSON completo por chave)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS crm_state (
        state_key VARCHAR(100) PRIMARY KEY,
        state_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.release();
    console.log('✓ Tabelas prontas');
  } catch (error) {
    console.error('⚠ Erro ao inicializar tabelas:', error.message);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running' });
});

// ===== FUNNELS =====
app.get('/api/funnels', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM funnels ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/funnels', async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO funnels (id, name, description) VALUES (?, ?, ?)', [id, name, description || '']);
    await connection.release();
    res.status(201).json({ id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/funnels/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE funnels SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/funnels/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM funnels WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LEADS =====
app.get('/api/leads', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM leads ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, status, funnel_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO leads (id, name, email, phone, status, funnel_id) VALUES (?, ?, ?, ?, ?, ?)', 
      [id, name, email, phone, status, funnel_id]);
    await connection.release();
    res.status(201).json({ id, name, email, phone, status, funnel_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { name, email, phone, status, funnel_id } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE leads SET name = ?, email = ?, phone = ?, status = ?, funnel_id = ? WHERE id = ?',
      [name, email, phone, status, funnel_id, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, name, email, phone, status, funnel_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PACIENTES =====
app.get('/api/pacientes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM pacientes ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pacientes', async (req, res) => {
  try {
    const { nome, email, phone, status, coluna_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO pacientes (id, nome, email, phone, status, coluna_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nome, email, phone, status, coluna_id]);
    await connection.release();
    res.status(201).json({ id, nome, email, phone, status, coluna_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { nome, email, phone, status, coluna_id } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE pacientes SET nome = ?, email = ?, phone = ?, status = ?, coluna_id = ? WHERE id = ?',
      [nome, email, phone, status, coluna_id, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, nome, email, phone, status, coluna_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM pacientes WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TAREFAS =====
app.get('/api/tarefas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM tarefas ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tarefas', async (req, res) => {
  try {
    const { titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO tarefas (id, titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento]);
    await connection.release();
    res.status(201).json({ id, titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tarefas/:id', async (req, res) => {
  try {
    const { titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE tarefas SET titulo = ?, descricao = ?, status = ?, tipo = ?, lead_id = ?, paciente_id = ?, data_vencimento = ? WHERE id = ?',
      [titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, titulo, descricao, status, tipo, lead_id, paciente_id, data_vencimento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM tarefas WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ATIVIDADES =====
app.get('/api/atividades', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM atividades ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/atividades', async (req, res) => {
  try {
    const { tipo, status, observacao, descricao, lead_id, paciente_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO atividades (id, tipo, status, observacao, descricao, lead_id, paciente_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, tipo, status, observacao, descricao || observacao, lead_id, paciente_id]);
    await connection.release();
    res.status(201).json({ id, tipo, status, observacao, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/atividades/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM atividades WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== AGENDAMENTOS =====
app.get('/api/agendamentos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM agendamentos ORDER BY data_hora DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const { titulo, data_hora, local, lead_id, paciente_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO agendamentos (id, titulo, data_hora, local, lead_id, paciente_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, titulo, data_hora, local, lead_id, paciente_id]);
    await connection.release();
    res.status(201).json({ id, titulo, data_hora, local, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { titulo, data_hora, local, lead_id, paciente_id } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE agendamentos SET titulo = ?, data_hora = ?, local = ?, lead_id = ?, paciente_id = ? WHERE id = ?',
      [titulo, data_hora, local, lead_id, paciente_id, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, titulo, data_hora, local, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ORÇAMENTOS =====
app.get('/api/orcamentos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM orcamentos ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orcamentos', async (req, res) => {
  try {
    const { titulo, valor, status, lead_id, paciente_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO orcamentos (id, titulo, valor, status, lead_id, paciente_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, titulo, valor, status, lead_id, paciente_id]);
    await connection.release();
    res.status(201).json({ id, titulo, valor, status, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orcamentos/:id', async (req, res) => {
  try {
    const { titulo, valor, status, lead_id, paciente_id } = req.body;
    const connection = await pool.getConnection();
    await connection.execute('UPDATE orcamentos SET titulo = ?, valor = ?, status = ?, lead_id = ?, paciente_id = ? WHERE id = ?',
      [titulo, valor, status, lead_id, paciente_id, req.params.id]);
    await connection.release();
    res.json({ id: req.params.id, titulo, valor, status, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orcamentos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM orcamentos WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TAREFAS POR TELEFONE (para sincronizar com Google Sheets) =====

// GET - busca todas as tarefas de um contato por telefone (lead ou paciente)
app.get('/api/tarefas-by-phone/:telefone', async (req, res) => {
  try {
    const { telefone } = req.params;
    const cleanPhone = telefone.replace(/\D/g, '');
    const connection = await pool.getConnection();

    // Buscar tarefas linkedadas a leads ou pacientes com esse telefone
    const [rows] = await connection.execute(`
      SELECT t.* FROM tarefas t
      LEFT JOIN leads l ON t.lead_id = l.id
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(l.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
         OR REPLACE(REPLACE(REPLACE(REPLACE(p.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
      ORDER BY t.created_at DESC
    `, [cleanPhone, cleanPhone]);

    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - busca todas as atividades de um contato por telefone
app.get('/api/atividades-by-phone/:telefone', async (req, res) => {
  try {
    const { telefone } = req.params;
    const cleanPhone = telefone.replace(/\D/g, '');
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(`
      SELECT a.* FROM atividades a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(l.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
         OR REPLACE(REPLACE(REPLACE(REPLACE(p.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
      ORDER BY a.created_at DESC
    `, [cleanPhone, cleanPhone]);

    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - busca todas as anotações de um contato por telefone
app.get('/api/anotacoes-by-phone/:telefone', async (req, res) => {
  try {
    const { telefone } = req.params;
    const cleanPhone = telefone.replace(/\D/g, '');
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(`
      SELECT a.* FROM anotacoes a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN pacientes p ON a.paciente_id = p.id
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(l.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
         OR REPLACE(REPLACE(REPLACE(REPLACE(p.phone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
      ORDER BY a.created_at DESC
    `, [cleanPhone, cleanPhone]);

    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ANOTAÇÕES =====
app.get('/api/anotacoes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM anotacoes ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/anotacoes', async (req, res) => {
  try {
    const { texto, lead_id, paciente_id } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO anotacoes (id, texto, lead_id, paciente_id) VALUES (?, ?, ?, ?)',
      [id, texto, lead_id, paciente_id]);
    await connection.release();
    res.status(201).json({ id, texto, lead_id, paciente_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/anotacoes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM anotacoes WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CRM STATE SYNC (bulk JSON sync) =====

// GET - busca todo o estado do CRM do MySQL
app.get('/api/crm-state', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT state_key, state_value FROM crm_state');
    await connection.release();

    const state = {};
    for (const row of rows) {
      try {
        state[row.state_key] = JSON.parse(row.state_value);
      } catch {
        state[row.state_key] = row.state_value;
      }
    }
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - salva todo o estado do CRM no MySQL
app.put('/api/crm-state', async (req, res) => {
  try {
    const state = req.body;
    const connection = await pool.getConnection();

    for (const [key, value] of Object.entries(state)) {
      const jsonValue = JSON.stringify(value);
      await connection.execute(
        'INSERT INTO crm_state (state_key, state_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_value = ?, updated_at = CURRENT_TIMESTAMP',
        [key, jsonValue, jsonValue]
      );
    }

    await connection.release();
    res.json({ ok: true, keys: Object.keys(state) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - busca uma chave específica
app.get('/api/crm-state/:key', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT state_value FROM crm_state WHERE state_key = ?', [req.params.key]);
    await connection.release();

    if (rows.length === 0) {
      return res.json(null);
    }
    try {
      res.json(JSON.parse(rows[0].state_value));
    } catch {
      res.json(rows[0].state_value);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

initializeTables().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server rodando na porta ${PORT}`);
    console.log(`✓ MySQL conectado`);
  });
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
