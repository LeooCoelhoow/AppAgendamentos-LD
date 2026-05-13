/**
 * ============================================================
 * middleware/adminMiddleware.ts — Middleware de Autorização Admin
 * ============================================================
 *
 * Verifica se o usuário autenticado tem o papel ADMIN.
 * Deve ser usado APÓS o authMiddleware, pois depende
 * de req.userRole estar preenchido.
 *
 * Se o usuário não for ADMIN, retorna 403 (Forbidden).
 *
 * Uso nas rotas:
 *   router.get('/rota-admin', authMiddleware, adminMiddleware, controller);
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que verifica se o usuário é administrador
 *
 * @param req - Request do Express (com userRole do authMiddleware)
 * @param res - Response do Express
 * @param next - Função para passar ao próximo middleware
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Verifica se o papel do usuário é ADMIN
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({
      error: 'Acesso negado. Apenas administradores podem acessar este recurso.',
      code: 'FORBIDDEN',
    });
    return;
  }

  // Usuário é ADMIN — segue para o próximo middleware/controller
  return next();
}
