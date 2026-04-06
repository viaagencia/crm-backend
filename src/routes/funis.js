import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../db.js';

const router = express.Router();

// GET todos os funis
router.get('/', async (req, res) => {
  try {
    const funis = await dbAll('SELECT * FROM funis ORDER BY ordem ASC');

    // Para cada funil, buscar suas etapas
    const funisComEtapas = await Promise.all(
      funis.map(async (funil) => {
        const etapas = await dbAll('SELECT * FROM etapas WHERE funilId = ? ORDER BY ordem ASC', [funil.id]);
        return { ...funil, etapas };
      })
    );

    res.json(funisComEtapas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET um funil específico com suas etapas
router.get('/:id', async (req, res) => {
  try {
    const funil = await dbGet('SELECT * FROM funis WHERE id = ?', [req.params.id]);
    if (!funil) return res.status(404).json({ erro: 'Funil não encontrado' });

    const etapas = await dbAll('SELECT * FROM etapas WHERE funilId = ? ORDER BY ordem ASC', [req.params.id]);
    funil.etapas = etapas;

    res.json(funil);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST criar novo funil
router.post('/', async (req, res) => {
  try {
    const { usuarioId, nome, descricao, etapas } = req.body;

    if (!usuarioId || !nome) {
      return res.status(400).json({ erro: 'usuarioId e nome do funil são obrigatórios' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();

    // Contar quantos funis já existem para determinar a ordem
    const countResult = await dbGet('SELECT COUNT(*) as count FROM funis WHERE usuarioId = ?', [usuarioId]);
    const ordem = (countResult?.count || 0) + 1;

    await dbRun(
      `INSERT INTO funis (id, usuarioId, nome, descricao, ordem, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, usuarioId, nome, descricao || '', ordem, agora, agora]
    );

    // Inserir etapas se fornecidas
    let etapasInserted = [];
    if (Array.isArray(etapas) && etapas.length > 0) {
      for (let i = 0; i < etapas.length; i++) {
        const etapaId = uuidv4();
        const etapa = etapas[i];
        await dbRun(
          `INSERT INTO etapas (id, funilId, nome, ordem, cor, criadoEm)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [etapaId, id, etapa.nome, i + 1, etapa.cor || '#cccccc', agora]
        );
        etapasInserted.push({ id: etapaId, nome: etapa.nome, ordem: i + 1, cor: etapa.cor });
      }
    }

    res.status(201).json({
      id,
      nome,
      descricao,
      ordem,
      etapas: etapasInserted,
      criadoEm: agora
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ erro: 'Funil com esse nome já existe' });
    }
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar funil
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const agora = new Date().toISOString();

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    updates.push('atualizadoEm = ?');
    values.push(agora);
    values.push(req.params.id);

    await dbRun(
      `UPDATE funis SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const funil = await dbGet('SELECT * FROM funis WHERE id = ?', [req.params.id]);
    const etapas = await dbAll('SELECT * FROM etapas WHERE funilId = ? ORDER BY ordem ASC', [req.params.id]);
    funil.etapas = etapas;

    res.json(funil);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE funil
router.delete('/:id', async (req, res) => {
  try {
    const funil = await dbGet('SELECT id FROM funis WHERE id = ?', [req.params.id]);
    if (!funil) return res.status(404).json({ erro: 'Funil não encontrado' });

    await dbRun('DELETE FROM funis WHERE id = ?', [req.params.id]);

    res.json({ msg: 'Funil excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST adicionar etapa a um funil
router.post('/:id/etapas', async (req, res) => {
  try {
    const { nome, cor } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome da etapa é obrigatório' });
    }

    const funil = await dbGet('SELECT id FROM funis WHERE id = ?', [req.params.id]);
    if (!funil) return res.status(404).json({ erro: 'Funil não encontrado' });

    // Contar etapas existentes para determinar a ordem
    const countResult = await dbGet('SELECT COUNT(*) as count FROM etapas WHERE funilId = ?', [req.params.id]);
    const ordem = (countResult?.count || 0) + 1;

    const etapaId = uuidv4();
    const agora = new Date().toISOString();

    await dbRun(
      `INSERT INTO etapas (id, funilId, nome, ordem, cor, criadoEm)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [etapaId, req.params.id, nome, ordem, cor || '#cccccc', agora]
    );

    const etapa = await dbGet('SELECT * FROM etapas WHERE id = ?', [etapaId]);
    res.status(201).json(etapa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT atualizar etapa
router.put('/:funilId/etapas/:etapaId', async (req, res) => {
  try {
    const { nome, cor } = req.body;

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (cor !== undefined) {
      updates.push('cor = ?');
      values.push(cor);
    }

    if (updates.length === 0) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' });
    }

    values.push(req.params.etapaId);

    await dbRun(
      `UPDATE etapas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const etapa = await dbGet('SELECT * FROM etapas WHERE id = ?', [req.params.etapaId]);
    res.json(etapa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE etapa
router.delete('/:funilId/etapas/:etapaId', async (req, res) => {
  try {
    const etapa = await dbGet('SELECT id FROM etapas WHERE id = ?', [req.params.etapaId]);
    if (!etapa) return res.status(404).json({ erro: 'Etapa não encontrada' });

    await dbRun('DELETE FROM etapas WHERE id = ?', [req.params.etapaId]);

    res.json({ msg: 'Etapa excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
