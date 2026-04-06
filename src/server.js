const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do MySQL para Hostinger
const pool = mysql.createPool({
  host: 'localhost',
  user: 'u891142242_viadigital',
  password: '@Via2025',
  database: 'u891142242_Via',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Função para inicializar tabelas
async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // Tabela de Leads/Clientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(50),
        funnel_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

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

    // Tabela de Contatos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(36) PRIMARY KEY,
        lead_id VARCHAR(36),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    await connection.release();
    console.log('✓ Tabelas inicializadas com sucesso');
    return true;
  } catch (error) {
    console.error('⚠ Erro ao inicializar tabelas:', error.message);
    return false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), database: 'mysql' });
});

// LEADS - GET todos
app.get('/api/leads', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM leads ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    console.error('Erro GET /api/leads:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// LEADS - GET por ID
app.get('/api/leads/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    await connection.release();
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEADS - POST (criar)
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, status, funnel_id } = req.body;
    const id = uuidv4();
    
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO leads (id, name, email, phone, status, funnel_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, status || 'novo', funnel_id]
    );
    await connection.release();
    
    res.status(201).json({ id, name, email, phone, status: status || 'novo', funnel_id });
  } catch (error) {
    console.error('Erro POST /api/leads:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// LEADS - PUT (atualizar)
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { name, email, phone, status, funnel_id } = req.body;
    
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE leads SET name = ?, email = ?, phone = ?, status = ?, funnel_id = ? WHERE id = ?',
      [name, email, phone, status, funnel_id, req.params.id]
    );
    await connection.release();
    
    res.json({ id: req.params.id, name, email, phone, status, funnel_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LEADS - DELETE
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

// FUNIS - GET todos
app.get('/api/funnels', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM funnels ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    console.error('Erro GET /api/funnels:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// FUNIS - POST (criar)
app.post('/api/funnels', async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO funnels (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || '']
    );
    await connection.release();
    
    res.status(201).json({ id, name, description: description || '' });
  } catch (error) {
    console.error('Erro POST /api/funnels:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// FUNIS - PUT (atualizar)
app.put('/api/funnels/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE funnels SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    await connection.release();
    
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FUNIS - DELETE
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

// CONTATOS - GET todos
app.get('/api/contacts', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM contacts ORDER BY created_at DESC');
    await connection.release();
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CONTATOS - POST
app.post('/api/contacts', async (req, res) => {
  try {
    const { lead_id, name, email, phone } = req.body;
    const id = uuidv4();
    
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO contacts (id, lead_id, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      [id, lead_id, name, email, phone]
    );
    await connection.release();
    
    res.status(201).json({ id, lead_id, name, email, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicializar e start
initializeTables().then((success) => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Servidor rodando na porta ${PORT}`);
    if (success) {
      console.log(`✓ MySQL conectado e tabelas prontas`);
    } else {
      console.log(`⚠ Aviso: Verificar conexão MySQL`);
    }
  });
}).catch(error => {
  console.error('Erro fatal ao iniciar servidor:', error);
  process.exit(1);
});
