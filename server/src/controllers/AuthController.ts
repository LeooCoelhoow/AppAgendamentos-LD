/**
 * ============================================================
 * controllers/AuthController.ts — Controlador de Autenticação
 * ============================================================
 *
 * Contém a lógica de negócio para:
 *   - register: Cadastro de novo usuário (hash de senha + JWT)
 *   - login: Autenticação por e-mail e senha (verifica hash + JWT)
 *
 * Segurança:
 *   - Senhas são hasheadas com bcryptjs (10 rounds de salt)
 *   - Tokens JWT expiram em 7 dias
 *   - E-mails duplicados retornam erro 409 (Conflict)
 *   - Senhas NUNCA são retornadas nas respostas
 *
 * Uso:
 *   import { AuthController } from '../controllers/AuthController';
 *   router.post('/register', AuthController.register);
 *   router.post('/login', AuthController.login);
 * ============================================================
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const AuthController = {
  /**
   * Cadastro de novo usuário
   *
   * Fluxo:
   * 1. Recebe name, email, phone, password do body
   * 2. Verifica se o e-mail já existe no banco
   * 3. Hasheia a senha com bcrypt (10 salt rounds)
   * 4. Cria o usuário no banco via Prisma
   * 5. Gera um token JWT
   * 6. Retorna o usuário (sem senha) + token
   *
   * @route POST /auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;

      // ──── Validação básica dos campos ────
      if (!name || !email || !phone || !password) {
        res.status(400).json({
          error: 'Todos os campos são obrigatórios: name, email, phone, password.',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      // ──── Verifica se o e-mail já está em uso ────
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Este e-mail já está cadastrado.',
          code: 'EMAIL_ALREADY_EXISTS',
        });
        return;
      }

      // ──── Hasheia a senha (10 rounds de salt) ────
      const hashedPassword = await bcrypt.hash(password, 10);

      // ──── Cria o usuário no banco de dados ────
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
        },
      });

      // ──── Gera o token JWT (expira em 7 dias) ────
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // ──── Retorna o usuário (sem senha) + token ────
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('❌ Erro no register:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Login do usuário
   *
   * Fluxo:
   * 1. Recebe email e password do body
   * 2. Busca o usuário pelo e-mail no banco
   * 3. Compara a senha fornecida com o hash armazenado
   * 4. Gera um token JWT
   * 5. Retorna o usuário (sem senha) + token
   *
   * @route POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // ──── Validação básica ────
      if (!email || !password) {
        res.status(400).json({
          error: 'E-mail e senha são obrigatórios.',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      // ──── Busca o usuário pelo e-mail ────
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Usuário não encontrado
      if (!user) {
        res.status(401).json({
          error: 'E-mail ou senha incorretos.',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // ──── Compara a senha com o hash ────
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        res.status(401).json({
          error: 'E-mail ou senha incorretos.',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // ──── Gera o token JWT ────
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // ──── Retorna o usuário (sem senha) + token ────
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
