import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/crm.db');

// Criar pasta data se não existir
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✓ Conectado ao banco SQLite:', DB_PATH);
    initDatabase();
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

function initDatabase() {
  db.serialize(() => {
    // Tabela de Leads
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL UNIQUE,
        email TEXT,
        origem TEXT,
        etapa TEXT DEFAULT 'Novo',
        criadoEm TEXT NOT NULL,
        atualizadoEm TEXT NOT NULL,
        sincronizadoComPlanilha INTEGER DEFAULT 0
      )
    `);

    // Tabela de Pacientes
    db.run(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL UNIQUE,
        email TEXT,
        dataNascimento TEXT,
        criadoEm TEXT NOT NULL,
        atualizadoEm TEXT NOT NULL
      )
    `);

    // Tabela de Atividades
    db.run(`
      CREATE TABLE IF NOT EXISTS atividades (
        id TEXT PRIMARY KEY,
        contatoId TEXT NOT NULL,
        contatoTipo TEXT NOT NULL,
        tipo TEXT NOT NULL,
        status TEXT NOT NULL,
        observacao TEXT,
        criadoEm TEXT NOT NULL,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Funis (Pipelines)
    db.run(`
      CREATE TABLE IF NOT EXISTS funis (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT,
        ordem INTEGER DEFAULT 0,
        criadoEm TEXT NOT NULL,
        atualizadoEm TEXT NOT NULL
      )
    `);

    // Tabela de Etapas do Funil
    db.run(`
      CREATE TABLE IF NOT EXISTS etapas (
        id TEXT PRIMARY KEY,
        funilId TEXT NOT NULL,
        nome TEXT NOT NULL,
        ordem INTEGER NOT NULL,
        cor TEXT,
        criadoEm TEXT NOT NULL,
        FOREIGN KEY(funilId) REFERENCES funis(id) ON DELETE CASCADE,
        UNIQUE(funilId, nome)
      )
    `);

    // Tabela de Tarefas
    db.run(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id TEXT PRIMARY KEY,
        contatoId TEXT NOT NULL,
        titulo TEXT NOT NULL,
        status TEXT NOT NULL,
        dataHora TEXT,
        criadoEm TEXT NOT NULL,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Anotações
    db.run(`
      CREATE TABLE IF NOT EXISTS anotacoes (
        id TEXT PRIMARY KEY,
        contatoId TEXT NOT NULL,
        texto TEXT NOT NULL,
        criadoEm TEXT NOT NULL,
        FOREIGN KEY(contatoId) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);

    // Tabela de Telefones Apagados (blacklist)
    db.run(`
      CREATE TABLE IF NOT EXISTS telefones_apagados (
        telefone TEXT PRIMARY KEY,
        motivo TEXT,
        apagadoEm TEXT NOT NULL
      )
    `);

    console.log('✓ Tabelas inicializadas com sucesso');
  });
}

// Helpers para queries com Promise
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export default db;
