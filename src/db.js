const mysql = require('mysql2/promise');

// Create a pool of connections
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'u891142242_crm',
  password: 'CrmVia@2025!',
  database: 'u891142242_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database tables
const initializeTables = async () => {
  const connection = await pool.getConnection();
  try {
    // Leads table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) PRIMARY KEY,
        nomeCompleto VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telefone VARCHAR(20),
        origem VARCHAR(100),
        status VARCHAR(50),
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Pacientes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id VARCHAR(36) PRIMARY KEY,
        nomeCompleto VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telefone VARCHAR(20),
        dataNascimento DATE,
        cpf VARCHAR(20),
        endereco VARCHAR(255),
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tarefas table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id VARCHAR(36) PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(50),
        prioridade VARCHAR(20),
        contatoId VARCHAR(36),
        dataVencimento DATE,
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Atividades table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS atividades (
        id VARCHAR(36) PRIMARY KEY,
        tipo VARCHAR(50),
        descricao TEXT,
        contatoId VARCHAR(36),
        dataHora DATETIME,
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Anotacoes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS anotacoes (
        id VARCHAR(36) PRIMARY KEY,
        conteudo TEXT,
        contatoId VARCHAR(36),
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Funis table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS funis (
        id VARCHAR(36) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        etapas JSON,
        usuarioId VARCHAR(36) NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Tables initialized successfully');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Database operations
const db = {
  // Initialize tables
  init: initializeTables,

  // Leads operations
  createLead: async (id, nomeCompleto, email, telefone, origem, status, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO leads (id, nomeCompleto, email, telefone, origem, status, usuarioId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, nomeCompleto, email, telefone, origem, status, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getLeads: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM leads WHERE usuarioId = ?',
        [usuarioId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  updateLead: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE leads SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deleteLead: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM leads WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  },

  // Pacientes operations
  createPaciente: async (id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO pacientes (id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getPacientes: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM pacientes WHERE usuarioId = ?',
        [usuarioId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  updatePaciente: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE pacientes SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deletePaciente: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM pacientes WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  },

  // Tarefas operations
  createTarefa: async (id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO tarefas (id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getTarefas: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tarefas WHERE usuarioId = ?',
        [usuarioId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  getTarefasByContato: async (contatoId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tarefas WHERE contatoId = ?',
        [contatoId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  updateTarefa: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE tarefas SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deleteTarefa: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM tarefas WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  },

  // Atividades operations
  createAtividade: async (id, tipo, descricao, contatoId, dataHora, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO atividades (id, tipo, descricao, contatoId, dataHora, usuarioId) VALUES (?, ?, ?, ?, ?, ?)',
        [id, tipo, descricao, contatoId, dataHora, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getAtividades: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM atividades WHERE usuarioId = ? ORDER BY dataHora DESC',
        [usuarioId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  getAtividadesByContato: async (contatoId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM atividades WHERE contatoId = ? ORDER BY dataHora DESC',
        [contatoId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  updateAtividade: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE atividades SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deleteAtividade: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM atividades WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  },

  // Anotacoes operations
  createAnotacao: async (id, conteudo, contatoId, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO anotacoes (id, conteudo, contatoId, usuarioId) VALUES (?, ?, ?, ?)',
        [id, conteudo, contatoId, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getAnotacoes: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM anotacoes WHERE usuarioId = ?',
        [usuarioId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  getAnotacoesByContato: async (contatoId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM anotacoes WHERE contatoId = ?',
        [contatoId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  updateAnotacao: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE anotacoes SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deleteAnotacao: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM anotacoes WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  },

  // Funis operations
  createFunil: async (id, nome, descricao, etapas, usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const etapasJson = typeof etapas === 'string' ? etapas : JSON.stringify(etapas);
      await connection.execute(
        'INSERT INTO funis (id, nome, descricao, etapas, usuarioId) VALUES (?, ?, ?, ?, ?)',
        [id, nome, descricao, etapasJson, usuarioId]
      );
    } finally {
      connection.release();
    }
  },

  getFunis: async (usuarioId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM funis WHERE usuarioId = ?',
        [usuarioId]
      );
      return rows.map(row => ({
        ...row,
        etapas: typeof row.etapas === 'string' ? JSON.parse(row.etapas) : row.etapas
      }));
    } finally {
      connection.release();
    }
  },

  updateFunil: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      if (updates.etapas && typeof updates.etapas !== 'string') {
        updates.etapas = JSON.stringify(updates.etapas);
      }
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      await connection.execute(
        `UPDATE funis SET ${setClause} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  },

  deleteFunil: async (id) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM funis WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
};

module.exports = db;
