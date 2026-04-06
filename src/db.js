import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u89114242_viadigital',
  password: process.env.DB_PASSWORD || '@Via2025',
  database: process.env.DB_NAME || 'u89114242_Via',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Inicializar banco de dados
async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('✓ Conectado ao banco MySQL:', process.env.DB_NAME || 'u89114242_Via');

    // Tabela de Usuários
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255),
        ativo INT DEFAULT 1,
        criadoEm DATETIME NOT NULL,
        atualizadoEm DATETIME NOT NULL
      )
    `);

    // Tabela de Leads
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        origem VARCHAR(100),
        etapa VARCHAR(50) DEFAULT 'Novo',
        criadoEm DATETIME NOT NULL,
        atualizadoEm DATETIME NOT NULL,
        sincronizadoComPlanilha INT DEFAULT 0,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE(usuarioId, telefone)
      )
    `);

    // Tabela de Pacientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        dataNascimento DATE,
        criadoEm DATETIME NOT NULL,
        atualizadoEm DATETIME NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE(usuarioId, telefone)
      )
    `);

    // Tabela de Atividades
    await connection.query(`
      CREATE TABLE IF NOT EXISTS atividades (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        contatoId VARCHAR(36) NOT NULL,
        contatoTipo VARCHAR(50) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        observacao TEXT,
        criadoEm DATETIME NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Funis (Pipelines)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS funis (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        ordem INT DEFAULT 0,
        criadoEm DATETIME NOT NULL,
        atualizadoEm DATETIME NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE(usuarioId, nome)
      )
    `);

    // Tabela de Etapas do Funil
    await connection.query(`
      CREATE TABLE IF NOT EXISTS etapas (
        id VARCHAR(36) PRIMARY KEY,
        funilId VARCHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        ordem INT NOT NULL,
        cor VARCHAR(7),
        criadoEm DATETIME NOT NULL,
        FOREIGN KEY(funilId) REFERENCES funis(id) ON DELETE CASCADE,
        UNIQUE(funilId, nome)
      )
    `);

    // Tabela de Tarefas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        contatoId VARCHAR(36) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        dataHora DATETIME,
        criadoEm DATETIME NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Anotações
    await connection.query(`
      CREATE TABLE IF NOT EXISTS anotacoes (
        id VARCHAR(36) PRIMARY KEY,
        usuarioId VARCHAR(36) NOT NULL,
        contatoId VARCHAR(36) NOT NULL,
        texto TEXT NOT NULL,
        criadoEm DATETIME NOT NULL,
        FOREIGN KEY(usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Telefones Apagados (blacklist)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS telefones_apagados (
        telefone VARCHAR(20) PRIMARY KEY,
        motivo TEXT,
        apagadoEm DATETIME NOT NULL
      )
    `);

    console.log('✓ Tabelas inicializadas com sucesso');
    connection.release();
  } catch (err) {
    console.error('Erro ao inicializar banco de dados:', err);
  }
}

// Inicializar ao importar
initDatabase();

// Helpers para queries com Promise
export async function dbRun(sql, params = []) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(sql, params);
    connection.release();
    return { id: result.insertId, changes: result.affectedRows };
  } catch (err) {
    throw err;
  }
}

export async function dbGet(sql, params = []) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    connection.release();
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
}

export async function dbAll(sql, params = []) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    connection.release();
    return rows || [];
  } catch (err) {
    throw err;
  }
}

export default pool;
