/**
 * ============================================================
 * routes/expense.routes.ts — Rotas de Despesas (Admin)
 * ============================================================
 *
 * Rotas para gerenciamento de despesas no relatório financeiro:
 *   POST   /expenses     — Criar despesa
 *   GET    /expenses     — Listar despesas
 *   DELETE /expenses/:id — Remover despesa
 *
 * Todas as rotas requerem autenticação + autorização ADMIN.
 * ============================================================
 */

import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const expenseRoutes = Router();

// ──── Todas as rotas requerem autenticação + admin ────
expenseRoutes.use(authMiddleware);
expenseRoutes.use(adminMiddleware);

/** Criar nova despesa */
expenseRoutes.post('/', ExpenseController.create);

/** Listar todas as despesas */
expenseRoutes.get('/', ExpenseController.getAll);

/** Remover despesa */
expenseRoutes.delete('/:id', ExpenseController.delete);

export { expenseRoutes };
