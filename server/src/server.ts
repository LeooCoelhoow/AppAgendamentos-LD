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

// ──── Middlewares Globais ────

const corsOptions = {
  // Lista exata de quem pode acessar a API
  origin: ['https://ldbeautyfrontend.vercel.app', 'http://localhost:8081', 'http://10.0.2.2:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true // <-- ISSO É OBRIGATÓRIO QUANDO A ORIGEM É ESPECÍFICA
};

/** CORS — permite requisições de qualquer origem (necessário para React Native) */
app.use(cors(corsOptions));

// O Segredo para Serverless: Força o Express a responder os "Preflights" (OPTIONS)
app.options('*', cors(corsOptions));

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