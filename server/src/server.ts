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
import { appointmentRoutes } from './routes/appointment.routes';
import { expenseRoutes } from './routes/expense.routes';
import { reportRoutes } from './routes/report.routes';

// ──── Inicialização do Express ────
const app = express();

// ──── MIDDLEWARE MANUAL E DEFINITIVO DE CORS ────
app.use((req, res, next) => {
  console.log(`[RADAR] 🛸 Requisição recebida: ${req.method} ${req.url}`);

  // Se for requisição do celular, libera qualquer origem
  const isMobile = req.get('User-Agent')?.includes('ReactNative') || false;

  if (isMobile) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Libera geral
  } else {
    // Senão, só o site oficial
    res.setHeader('Access-Control-Allow-Origin', 'https://ldbeautyfrontend.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  // 2. O Segredo: Se o navegador estiver só "perguntando" (OPTIONS), responde com Sucesso (200) na hora!
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Se for uma requisição real (POST, GET), deixa passar para as rotas
  next();
});

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

/** Rotas de agendamentos (protegidas por JWT, admin routes com adminMiddleware) */
app.use('/appointments', appointmentRoutes);

/** Rotas de despesas (protegidas por JWT + Admin) */
app.use('/expenses', expenseRoutes);

/** Rotas de relatórios (protegidas por JWT + Admin) */
app.use('/reports', reportRoutes);

// ──── Inicialização do Servidor ────

// Apenas executa o app.listen se NÃO estiver no ambiente de produção da Vercel.
// Isso garante que o 'npm run dev' continue funcionando perfeitamente no seu computador local.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log('');
    console.log('  🌸 ════════════════════════════════════════');
    console.log(`  🚀 Servidor rodando localmente na porta ${PORT}`);
    console.log(`  📡 http://localhost:${PORT}`);
    console.log('  🌸 ════════════════════════════════════════');
    console.log('');
  });
}

// Exporta o app para a Vercel consumir
export default app;