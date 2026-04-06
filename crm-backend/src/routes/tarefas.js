import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todas as tarefas
router.get('/', async (req, res) => {
  try {
    const tarefas = await dbAll('SELECT * FROM tarefas ORDER BY criadoEm DESC');
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET tarefas de um contato
router.get('/contato/:contatoId', async (req, res) => {
  try {
    const tarefas = await dbAll(
      'SELECT * FROM tarefas WHERE contatoId = ? ORDER BY criadoEm DESC',
      [req.params.contatoId]
    );
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar nova tarefa
router.post('/', async (req, res) => {
  try {
    const { contatoId, titulo, status, dataHora } = req.body;

    if (!contatoId || !titulo) {
      return res.status(400).json({ erro: 'contatoId e titulo são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO tarefas (id, contatoId, titulo, status, dataHora, criadoEm)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, contatoId, titulo, status || 'pendente', dataHora || null, agora]
    );

    const tarefa = await dbGet('SELECT * FROM tarefas WHERE id = ?', [id]);
    res.status(201).json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar tarefa
router.put('/:id', async (req, res) => {
  try {
    const { titulo, status, dataHora } = req.body;

    const updates = [];
    const values = [];

    if (titulo !== undefined) {
      updates.push('titulo = ?');
      values.push(titulo);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (dataHora !== undefined) {
      updates.push('dataHora = ?');
      values.push(dataHora);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    values.push(req.params.id);

    await dbRun(
      `UPDATE tarefas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const tarefa = await dbGet('SELECT * FROM tarefas WHERE id = ?', [req.params.id]);
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE tarefa
router.delete('/:id', async (req, res) => {
  try {
    const tarefa = await dbGet('SELECT id FROM tarefas WHERE id = ?', [req.params.id]);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });

    await dbRun('DELETE FROM tarefas WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Tarefa excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
