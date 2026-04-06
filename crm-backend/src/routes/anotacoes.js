import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todas as anotações
router.get('/', async (req, res) => {
  try {
    const anotacoes = await dbAll('SELECT * FROM anotacoes ORDER BY criadoEm DESC');
    res.json(anotacoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET anotações de um contato
router.get('/contato/:contatoId', async (req, res) => {
  try {
    const anotacoes = await dbAll(
      'SELECT * FROM anotacoes WHERE contatoId = ? ORDER BY criadoEm DESC',
      [req.params.contatoId]
    );
    res.json(anotacoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar nova anotação
router.post('/', async (req, res) => {
  try {
    const { contatoId, texto } = req.body;

    if (!contatoId || !texto) {
      return res.status(400).json({ erro: 'contatoId e texto são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO anotacoes (id, contatoId, texto, criadoEm)
       VALUES (?, ?, ?, ?)`,
      [id, contatoId, texto, agora]
    );

    const anotacao = await dbGet('SELECT * FROM anotacoes WHERE id = ?', [id]);
    res.status(201).json(anotacao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar anotação
router.put('/:id', async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ erro: 'Texto é obrigatório' });
    }

    await dbRun(
      `UPDATE anotacoes SET texto = ? WHERE id = ?`,
      [texto, req.params.id]
    );

    const anotacao = await dbGet('SELECT * FROM anotacoes WHERE id = ?', [req.params.id]);
    res.json(anotacao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE anotação
router.delete('/:id', async (req, res) => {
  try {
    const anotacao = await dbGet('SELECT id FROM anotacoes WHERE id = ?', [req.params.id]);
    if (!anotacao) return res.status(404).json({ erro: 'Anotação não encontrada' });

    await dbRun('DELETE FROM anotacoes WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Anotação excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
