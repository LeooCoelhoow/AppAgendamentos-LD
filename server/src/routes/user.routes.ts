/**
 * ============================================================
 * routes/user.routes.ts — Rotas de Usuário (Protegidas)
 * ============================================================
 *
 * Define as rotas protegidas de gerenciamento de perfil:
 *   GET    /users/me — Retorna o perfil do usuário logado
 *   PUT    /users/me — Atualiza o perfil
 *   DELETE /users/me — Deleta a conta
 *
 * Todas as rotas requerem autenticação via JWT
 * (authMiddleware é aplicado no router).
 * ============================================================
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';

const userRoutes = Router();

// ──── Aplica autenticação em TODAS as rotas deste router ────
userRoutes.use(authMiddleware);

/** Retorna o perfil do usuário autenticado */
userRoutes.get('/me', UserController.getProfile);

/** Atualiza o perfil (name, email, phone) */
userRoutes.put('/me', UserController.updateProfile);

/** Deleta a conta do usuário */
userRoutes.delete('/me', UserController.deleteAccount);

export { userRoutes };
