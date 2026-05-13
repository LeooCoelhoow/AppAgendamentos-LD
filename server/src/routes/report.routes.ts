/**
 * ============================================================
 * routes/report.routes.ts — Rotas de Relatórios (Admin)
 * ============================================================
 *
 * Rotas para o relatório financeiro do administrador:
 *   GET /reports/financial?period=thisMonth|lastMonth|all
 *
 * Requer autenticação + autorização ADMIN.
 * ============================================================
 */

import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const reportRoutes = Router();

// ──── Autenticação + Admin ────
reportRoutes.use(authMiddleware);
reportRoutes.use(adminMiddleware);

/** Relatório financeiro com filtro de período */
reportRoutes.get('/financial', ReportController.getFinancial);

export { reportRoutes };
