import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente PRIMEIRO
dotenv.config();

// Importar rotas
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import pacientesRoutes from './routes/pacientes.js';
import atividadesRoutes from './routes/atividades.js';
import funisRoutes from './routes/funis.js';
import tarefasRoutes from './routes/tarefas.js';
import anotacoesRoutes from './routes/anotacoes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:8080')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check (ANTES das rotas)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadsRoutes);
  app.use('/api/pacientes', pacientesRoutes);
  app.use('/api/atividades', atividadesRoutes);
  app.use('/api/funis', funisRoutes);
  app.use('/api/tarefas', tarefasRoutes);
  app.use('/api/anotacoes', anotacoesRoutes);
  console.log('✓ Rotas carregadas com sucesso');
} catch (err) {
  console.error('✗ Erro ao carregar rotas:', err.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada', path: req.path });
});

// Error handler (DEVE ser o último)
app.use((err, req, res, next) => {
  console.error('✗ Erro na requisição:', err.message);
  console.error(err.stack);
  res.status(500).json({
    erro: err.message || 'Erro interno do servidor',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓✓✓ API iniciada com sucesso! ✓✓✓`);
  console.log(`🚀 Porta: ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`✓ CORS Origin: ${corsOrigin.join(', ')}\n`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Promise rejection não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('✗ Erro não capturado:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM recebido, encerrando gracefully...');
  server.close(() => {
    console.log('✓ Servidor encerrado');
    process.exit(0);
  });
});
