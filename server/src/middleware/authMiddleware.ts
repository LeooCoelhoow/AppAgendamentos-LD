/**
 * ============================================================
 * middleware/authMiddleware.ts — Middleware de Autenticação JWT
 * ============================================================
 *
 * Verifica se a requisição contém um token JWT válido no
 * header Authorization (formato: "Bearer <token>").
 *
 * Se o token for válido, decodifica os dados do usuário
 * e os anexa ao objeto `req` para uso nos controllers.
 *
 * Se o token estiver ausente ou inválido, retorna 401.
 *
 * Uso nas rotas:
 *   router.get('/rota-protegida', authMiddleware, controller);
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Payload do token JWT decodificado
 *
 * Contém o ID do usuário e seu papel (role)
 * para permitir controle de acesso.
 */
interface JwtPayload {
  /** ID do usuário no banco de dados (UUID) */
  userId: string;
  /** Papel do usuário: CLIENT ou ADMIN */
  role: string;
}

// Extende o tipo Request do Express para incluir o userId
declare global {
  namespace Express {
    interface Request {
      /** ID do usuário autenticado (extraído do JWT) */
      userId?: string;
      /** Papel do usuário autenticado */
      userRole?: string;
    }
  }
}

/**
 * Middleware que verifica e valida o token JWT
 *
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - Função para passar ao próximo middleware
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extrai o header Authorization
  const authHeader = req.headers.authorization;

  // Verifica se o header existe
  if (!authHeader) {
    res.status(401).json({
      error: 'Token de autenticação não fornecido.',
      code: 'TOKEN_MISSING',
    });
    return;
  }

  // O token vem no formato: "Bearer <token>"
  const parts = authHeader.split(' ');

  // Verifica se o formato está correto (2 partes)
  if (parts.length !== 2) {
    res.status(401).json({
      error: 'Formato de token inválido.',
      code: 'TOKEN_MALFORMED',
    });
    return;
  }

  const [scheme, token] = parts;

  // Verifica se começa com "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({
      error: 'Token mal formatado. Use: Bearer <token>',
      code: 'TOKEN_MALFORMED',
    });
    return;
  }

  try {
    // Decodifica e verifica o token usando a chave secreta
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JwtPayload;

    // Anexa os dados do usuário ao request
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Token válido — segue para o próximo middleware/controller
    return next();
  } catch (error) {
    // Token expirado ou inválido
    res.status(401).json({
      error: 'Token inválido ou expirado.',
      code: 'TOKEN_INVALID',
    });
    return;
  }
}
