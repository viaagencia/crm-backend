const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables
const initializeTables = async () => {
  try {
    // Create leads table
    const { data: leadsTable, error: leadsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nomeCompleto VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          telefone VARCHAR(20),
          origem VARCHAR(100),
          status VARCHAR(50),
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    // Create pacientes table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS pacientes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nomeCompleto VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          telefone VARCHAR(20),
          dataNascimento DATE,
          cpf VARCHAR(20),
          endereco VARCHAR(255),
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    // Create tarefas table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS tarefas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          titulo VARCHAR(255) NOT NULL,
          descricao TEXT,
          status VARCHAR(50),
          prioridade VARCHAR(20),
          contatoId UUID,
          dataVencimento DATE,
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    // Create atividades table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS atividades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tipo VARCHAR(50),
          descricao TEXT,
          contatoId UUID,
          dataHora TIMESTAMP,
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    // Create anotacoes table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS anotacoes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conteudo TEXT,
          contatoId UUID,
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    // Create funis table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS funis (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          etapas JSONB,
          usuarioId UUID NOT NULL,
          dataCriacao TIMESTAMP DEFAULT NOW(),
          dataAtualizacao TIMESTAMP DEFAULT NOW()
        )
      `
    });

    console.log('✓ Tables initialized successfully with Supabase');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error.message);
    throw error;
  }
};

// Database operations
const db = {
  init: initializeTables,
  supabase: supabase,

  // Leads operations
  createLead: async (id, nomeCompleto, email, telefone, origem, status, usuarioId) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ id, nomeCompleto, email, telefone, origem, status, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getLeads: async (usuarioId) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('usuarioId', usuarioId);
    if (error) throw error;
    return data || [];
  },

  updateLead: async (id, updates) => {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deleteLead: async (id) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Atividades operations
  createAtividade: async (id, tipo, descricao, contatoId, dataHora, usuarioId) => {
    const { data, error } = await supabase
      .from('atividades')
      .insert([{ id, tipo, descricao, contatoId, dataHora, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getAtividades: async (usuarioId) => {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('usuarioId', usuarioId)
      .order('dataHora', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getAtividadesByContato: async (contatoId) => {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .eq('contatoId', contatoId)
      .order('dataHora', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  updateAtividade: async (id, updates) => {
    const { data, error } = await supabase
      .from('atividades')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deleteAtividade: async (id) => {
    const { error } = await supabase
      .from('atividades')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Tarefas operations
  createTarefa: async (id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId) => {
    const { data, error } = await supabase
      .from('tarefas')
      .insert([{ id, titulo, descricao, status, prioridade, contatoId, dataVencimento, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getTarefas: async (usuarioId) => {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('usuarioId', usuarioId);
    if (error) throw error;
    return data || [];
  },

  getTarefasByContato: async (contatoId) => {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('contatoId', contatoId);
    if (error) throw error;
    return data || [];
  },

  updateTarefa: async (id, updates) => {
    const { data, error } = await supabase
      .from('tarefas')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deleteTarefa: async (id) => {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Anotacoes operations
  createAnotacao: async (id, conteudo, contatoId, usuarioId) => {
    const { data, error } = await supabase
      .from('anotacoes')
      .insert([{ id, conteudo, contatoId, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getAnotacoes: async (usuarioId) => {
    const { data, error } = await supabase
      .from('anotacoes')
      .select('*')
      .eq('usuarioId', usuarioId);
    if (error) throw error;
    return data || [];
  },

  getAnotacoesByContato: async (contatoId) => {
    const { data, error } = await supabase
      .from('anotacoes')
      .select('*')
      .eq('contatoId', contatoId);
    if (error) throw error;
    return data || [];
  },

  updateAnotacao: async (id, updates) => {
    const { data, error } = await supabase
      .from('anotacoes')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deleteAnotacao: async (id) => {
    const { error } = await supabase
      .from('anotacoes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Funis operations
  createFunil: async (id, nome, descricao, etapas, usuarioId) => {
    const etapasJson = typeof etapas === 'string' ? JSON.parse(etapas) : etapas;
    const { data, error } = await supabase
      .from('funis')
      .insert([{ id, nome, descricao, etapas: etapasJson, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getFunis: async (usuarioId) => {
    const { data, error } = await supabase
      .from('funis')
      .select('*')
      .eq('usuarioId', usuarioId);
    if (error) throw error;
    return data || [];
  },

  updateFunil: async (id, updates) => {
    if (updates.etapas && typeof updates.etapas !== 'object') {
      updates.etapas = JSON.parse(updates.etapas);
    }
    const { data, error } = await supabase
      .from('funis')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deleteFunil: async (id) => {
    const { error } = await supabase
      .from('funis')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Pacientes operations
  createPaciente: async (id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId) => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert([{ id, nomeCompleto, email, telefone, dataNascimento, cpf, endereco, usuarioId }]);
    if (error) throw error;
    return data;
  },

  getPacientes: async (usuarioId) => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('usuarioId', usuarioId);
    if (error) throw error;
    return data || [];
  },

  updatePaciente: async (id, updates) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  deletePaciente: async (id) => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

module.exports = db;
