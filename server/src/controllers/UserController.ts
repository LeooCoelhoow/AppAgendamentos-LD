/**
 * ============================================================
 * controllers/UserController.ts — Controlador de Usuários
 * ============================================================
 *
 * CRUD do perfil do usuário autenticado:
 *   - getProfile: Retorna os dados do usuário logado
 *   - updateProfile: Atualiza nome, e-mail e/ou telefone
 *   - deleteAccount: Remove a conta do usuário
 *
 * Todas as rotas requerem autenticação (authMiddleware).
 * O userId é extraído do token JWT (req.userId).
 *
 * Uso:
 *   import { UserController } from '../controllers/UserController';
 *   router.get('/me', authMiddleware, UserController.getProfile);
 * ============================================================
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const UserController = {
  /**
   * Retorna o perfil do usuário autenticado
   *
   * Busca o usuário pelo ID do JWT e retorna
   * seus dados (sem a senha).
   *
   * @route GET /users/me
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Busca o usuário pelo ID extraído do token JWT
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          // password: false — não incluímos a senha
        },
      });

      // Caso raro: token válido mas usuário deletado
      if (!user) {
        res.status(404).json({
          error: 'Usuário não encontrado.',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('❌ Erro no getProfile:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Atualiza o perfil do usuário autenticado
   *
   * Permite alterar: name, email, phone.
   * A senha NÃO é alterada por esta rota (futuramente
   * teremos uma rota separada para trocar senha).
   *
   * @route PUT /users/me
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone } = req.body;

      // Verifica se pelo menos um campo foi enviado
      if (!name && !email && !phone) {
        res.status(400).json({
          error: 'Envie pelo menos um campo para atualizar: name, email ou phone.',
          code: 'NO_FIELDS_TO_UPDATE',
        });
        return;
      }

      // Se o e-mail está sendo alterado, verifica se já existe
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        // Se o e-mail pertence a outro usuário, retorna erro
        if (existingUser && existingUser.id !== req.userId) {
          res.status(409).json({
            error: 'Este e-mail já está em uso por outra conta.',
            code: 'EMAIL_ALREADY_EXISTS',
          });
          return;
        }
      }

      // Monta o objeto de atualização apenas com campos enviados
      const updateData: { name?: string; email?: string; phone?: string } = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      // Atualiza no banco
      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('❌ Erro no updateProfile:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Deleta a conta do usuário autenticado
   *
   * Remove permanentemente o usuário e todos os seus
   * agendamentos do banco de dados.
   *
   * ⚠️ Esta ação é irreversível!
   *
   * @route DELETE /users/me
   */
  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      // Deleta todos os agendamentos do usuário primeiro
      await prisma.appointment.deleteMany({
        where: { userId: req.userId },
      });

      // Deleta o usuário
      await prisma.user.delete({
        where: { id: req.userId },
      });

      res.status(200).json({
        message: 'Conta deletada com sucesso.',
      });
    } catch (error) {
      console.error('❌ Erro no deleteAccount:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
