import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todos os leads
router.get('/', async (req, res) => {
  try {
    const leads = await dbAll('SELECT * FROM leads ORDER BY criadoEm DESC');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET um lead específico
router.get('/:id', async (req, res) => {
  try {
    const lead = await dbGet('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar novo lead
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, origem, etapa } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO leads (id, nome, telefone, email, origem, etapa, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nome, telefone, email || '', origem || 'Direto', etapa || 'Novo', agora, agora]
    );

    res.status(201).json({ id, nome, telefone, email, origem, etapa: etapa || 'Novo', criadoEm: agora });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ erro: 'Telefone já existe' });
    }
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar lead
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, origem, etapa } = req.body;
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
    if (origem !== undefined) {
      updates.push('origem = ?');
      values.push(origem);
    }
    if (etapa !== undefined) {
      updates.push('etapa = ?');
      values.push(etapa);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    updates.push('atualizadoEm = ?');
    values.push(agora);
    values.push(req.params.id);

    await dbRun(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const lead = await dbGet('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json(lead);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await dbGet('SELECT telefone FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });

    // Adicionar à blacklist
    const agora = new Date().toISOString();
    await dbRun(
      `INSERT OR IGNORE INTO telefones_apagados (telefone, motivo, apagadoEm) VALUES (?, ?, ?)`,
      [lead.telefone, 'Deletado pelo usuário', agora]
    );

    // Deletar lead
    await dbRun('DELETE FROM leads WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Lead excluído com sucesso', telefone: lead.telefone });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
