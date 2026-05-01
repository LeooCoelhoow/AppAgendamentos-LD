/**
 * ============================================================
 * server.ts — Entry Point do Backend (Express.js)
 * ============================================================
 *
 * Inicializa o servidor Express com:
 *   - CORS habilitado (permite requisições do React Native)
 *   - Body parser JSON (Express v5 built-in)
 *   - Rotas de autenticação (/auth)
 *   - Rotas de usuário (/users)
 *   - Rota de health check (/)
 *
 * Variáveis de ambiente (.env):
 *   PORT         — Porta do servidor (padrão: 3333)
 *   DATABASE_URL — URL de conexão com PostgreSQL
 *   JWT_SECRET   — Chave secreta para tokens JWT
 *
 * Para iniciar:
 *   npm run dev (desenvolvimento com nodemon)
 *   npm start   (produção)
 * ============================================================
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';

// ──── Inicialização do Express ────
const app = express();

// ──── Middlewares Globais ────

/** CORS — permite requisições de qualquer origem (necessário para React Native) */
app.use(cors());

/** Body parser JSON — interpreta o corpo das requisições como JSON */
app.use(express.json());

// ──── Rota de Health Check ────
/** Verifica se o servidor está rodando */
app.get('/', (_req, res) => {
  res.json({
    status: '🌸 API AppAgendamentos rodando!',
    version: '1.0.0',
    routes: {
      auth: '/auth/register, /auth/login',
      users: '/users/me',
    },
  });
});

// ──── Rotas da API ────

/** Rotas de autenticação (públicas) */
app.use('/auth', authRoutes);

/** Rotas de usuário (protegidas por JWT) */
app.use('/users', userRoutes);

// ──── Inicialização do Servidor ────
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log('');
  console.log('  🌸 ════════════════════════════════════════');
  console.log(`  🚀 Servidor rodando na porta ${PORT}`);
  console.log(`  📡 http://localhost:${PORT}`);
  console.log('  🌸 ════════════════════════════════════════');
  console.log('');
});
