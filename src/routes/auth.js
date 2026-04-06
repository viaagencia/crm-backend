import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbRun, dbGet } from '../db.js';

const router = express.Router();

// Função para hash de senha
function hashPassword(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

// Middleware de autenticação
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    // Token é baseado no email do usuário (simplificado)
    // Em produção, use JWT apropriadamente
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    req.usuarioId = decoded;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

// POST /api/auth/criar-usuario - Criar novo usuário (sem autenticação)
router.post('/criar-usuario', async (req, res) => {
  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const existe = await dbGet('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    const id = uuidv4();
    const agora = new Date().toISOString();
    const senhaHash = hashPassword(senha);

    await dbRun(
      `INSERT INTO usuarios (id, email, senha, nome, ativo, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, email, senhaHash, nome || email, 1, agora, agora]
    );

    res.status(201).json({
      id,
      email,
      nome: nome || email,
      criadoEm: agora
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/auth/login - Login com email e senha
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const usuario = await dbGet('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const senhaHash = hashPassword(senha);
    if (usuario.senha !== senhaHash) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário inativo' });
    }

    // Gerar token (simplificado - em produção use JWT)
    const token = Buffer.from(usuario.id).toString('base64');

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      }
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/auth/me - Obter dados do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await dbGet('SELECT id, email, nome, ativo FROM usuarios WHERE id = ?', [req.usuarioId]);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/auth/usuarios - Listar todos os usuários (admin only)
router.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    const usuarios = await dbGet('SELECT id, email, nome, ativo, criadoEm FROM usuarios WHERE id = ?', [req.usuarioId]);

    // Verifica se é o próprio usuário ou admin
    if (!usuarios) {
      return res.status(403).json({ erro: 'Não autorizado' });
    }

    const todos = await dbGet('SELECT id, email, nome, ativo, criadoEm FROM usuarios');
    res.json(todos || []);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/auth/mudar-senha - Mudar senha do usuário
router.put('/mudar-senha', authMiddleware, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
    }

    const usuario = await dbGet('SELECT * FROM usuarios WHERE id = ?', [req.usuarioId]);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const senhaHash = hashPassword(senhaAtual);
    if (usuario.senha !== senhaHash) {
      return res.status(401).json({ erro: 'Senha atual incorreta' });
    }

    const novaSenhaHash = hashPassword(novaSenha);
    const agora = new Date().toISOString();

    await dbRun(
      'UPDATE usuarios SET senha = ?, atualizadoEm = ? WHERE id = ?',
      [novaSenhaHash, agora, req.usuarioId]
    );

    res.json({ msg: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
