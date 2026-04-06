import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todas as atividades
router.get('/', async (req, res) => {
  try {
    const atividades = await dbAll('SELECT * FROM atividades ORDER BY criadoEm DESC');
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET atividades de um contato
router.get('/contato/:contatoId', async (req, res) => {
  try {
    const atividades = await dbAll(
      'SELECT * FROM atividades WHERE contatoId = ? ORDER BY criadoEm DESC',
      [req.params.contatoId]
    );
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar nova atividade
router.post('/', async (req, res) => {
  try {
    const { contatoId, contatoTipo, tipo, status, observacao } = req.body;

    if (!contatoId || !tipo || !status) {
      return res.status(400).json({ erro: 'contatoId, tipo e status são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO atividades (id, contatoId, contatoTipo, tipo, status, observacao, criadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, contatoId, contatoTipo || 'lead', tipo, status, observacao || '', agora]
    );

    const atividade = await dbGet('SELECT * FROM atividades WHERE id = ?', [id]);
    res.status(201).json(atividade);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar atividade
router.put('/:id', async (req, res) => {
  try {
    const { tipo, status, observacao } = req.body;

    const updates = [];
    const values = [];

    if (tipo !== undefined) {
      updates.push('tipo = ?');
      values.push(tipo);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (observacao !== undefined) {
      updates.push('observacao = ?');
      values.push(observacao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    values.push(req.params.id);

    await dbRun(
      `UPDATE atividades SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const atividade = await dbGet('SELECT * FROM atividades WHERE id = ?', [req.params.id]);
    res.json(atividade);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE atividade
router.delete('/:id', async (req, res) => {
  try {
    const atividade = await dbGet('SELECT id FROM atividades WHERE id = ?', [req.params.id]);
    if (!atividade) return res.status(404).json({ erro: 'Atividade não encontrada' });

    await dbRun('DELETE FROM atividades WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Atividade excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
