const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db-supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running', database: 'supabase' });
});

// ===== LEADS =====
app.get('/api/leads', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const leads = await db.getLeads(usuarioId);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { nomeCompleto, email, telefone, origem, status, usuarioId } = req.body;
    const id = uuidv4();
    await db.createLead(id, nomeCompleto, email, telefone, origem, status, usuarioId);
    res.json({ id, nomeCompleto, email, telefone, origem, status, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateLead(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteLead(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ATIVIDADES =====
app.get('/api/atividades', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const atividades = await db.getAtividades(usuarioId);
    res.json(atividades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/atividades', async (req, res) => {
  try {
    const { tipo, descricao, contatoId, dataHora, usuarioId } = req.body;
    const id = uuidv4();
    await db.createAtividade(id, tipo, descricao, contatoId, dataHora, usuarioId);
    res.json({ id, tipo, descricao, contatoId, dataHora, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/atividades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateAtividade(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/atividades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAtividade(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TAREFAS =====
app.get('/api/tarefas', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const tarefas = await db.getTarefas(usuarioId);
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tarefas', async (req, res) => {
  try {
    const { titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId } = req.body;
    const id = uuidv4();
    await db.createTarefa(id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId);
    res.json({ id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateTarefa(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteTarefa(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ANOTACOES =====
app.get('/api/anotacoes', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const anotacoes = await db.getAnotacoes(usuarioId);
    res.json(anotacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/anotacoes', async (req, res) => {
  try {
    const { conteudo, contatoId, usuarioId } = req.body;
    const id = uuidv4();
    await db.createAnotacao(id, conteudo, contatoId, usuarioId);
    res.json({ id, conteudo, contatoId, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/anotacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateAnotacao(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/anotacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteAnotacao(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== FUNIS =====
app.get('/api/funis', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const funis = await db.getFunis(usuarioId);
    res.json(funis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/funis', async (req, res) => {
  try {
    const { nome, descricao, etapas, usuarioId } = req.body;
    const id = uuidv4();
    await db.createFunil(id, nome, descricao, etapas, usuarioId);
    res.json({ id, nome, descricao, etapas, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/funis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateFunil(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/funis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFunil(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PACIENTES =====
app.get('/api/pacientes', async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const pacientes = await db.getPacientes(usuarioId);
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pacientes', async (req, res) => {
  try {
    const { nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId } = req.body;
    const id = uuidv4();
    await db.createPaciente(id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId);
    res.json({ id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updatePaciente(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deletePaciente(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Server rodando na porta ${PORT}`);
  console.log(`✓ Database: Supabase PostgreSQL`);
});
