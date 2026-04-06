import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rotas
import leadsRoutes from './routes/leads.js';
import pacientesRoutes from './routes/pacientes.js';
import atividadesRoutes from './routes/atividades.js';
import funisRoutes from './routes/funis.js';
import tarefasRoutes from './routes/tarefas.js';
import anotacoesRoutes from './routes/anotacoes.js';

// Carregar variáveis de ambiente
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:8080').split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/leads', leadsRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/funis', funisRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/anotacoes', anotacoesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: err.message || 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});
