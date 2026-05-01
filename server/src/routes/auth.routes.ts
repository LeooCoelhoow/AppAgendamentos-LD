/**
 * ============================================================
 * routes/auth.routes.ts — Rotas de Autenticação
 * ============================================================
 *
 * Define as rotas públicas de autenticação:
 *   POST /auth/register — Cadastro de novo usuário
 *   POST /auth/login    — Login e geração de JWT
 *
 * Estas rotas NÃO requerem autenticação (são públicas).
 * ============================================================
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();

// ──── Rotas Públicas de Autenticação ────

/** Cadastro de novo usuário */
authRoutes.post('/register', AuthController.register);

/** Login (e-mail + senha) → retorna JWT */
authRoutes.post('/login', AuthController.login);

export { authRoutes };
