import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todos os pacientes
router.get('/', async (req, res) => {
  try {
    const pacientes = await dbAll('SELECT * FROM pacientes ORDER BY criadoEm DESC');
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET um paciente específico
router.get('/:id', async (req, res) => {
  try {
    const paciente = await dbGet('SELECT * FROM pacientes WHERE id = ?', [req.params.id]);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar novo paciente
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, dataNascimento } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO pacientes (id, nome, telefone, email, dataNascimento, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, nome, telefone, email || '', dataNascimento || '', agora, agora]
    );

    res.status(201).json({ id, nome, telefone, email, dataNascimento, criadoEm: agora });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ erro: 'Telefone já existe' });
    }
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar paciente
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, dataNascimento } = req.body;
    const agora = new Date().toISOString();

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (telefone !== undefined) {
      updates.push('telefone = ?');
      values.push(telefone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (dataNascimento !== undefined) {
      updates.push('dataNascimento = ?');
      values.push(dataNascimento);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    updates.push('atualizadoEm = ?');
    values.push(agora);
    values.push(req.params.id);

    await dbRun(
      `UPDATE pacientes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const paciente = await dbGet('SELECT * FROM pacientes WHERE id = ?', [req.params.id]);
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE paciente
router.delete('/:id', async (req, res) => {
  try {
    const paciente = await dbGet('SELECT telefone FROM pacientes WHERE id = ?', [req.params.id]);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });

    // Adicionar à blacklist
    const agora = new Date().toISOString();
    await dbRun(
      `INSERT OR IGNORE INTO telefones_apagados (telefone, motivo, apagadoEm) VALUES (?, ?, ?)`,
      [paciente.telefone, 'Deletado pelo usuário', agora]
    );

    // Deletar paciente
    await dbRun('DELETE FROM pacientes WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Paciente excluído com sucesso', telefone: paciente.telefone });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
