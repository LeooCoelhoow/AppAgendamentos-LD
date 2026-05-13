/**
 * ============================================================
 * controllers/ExpenseController.ts — Controlador de Despesas
 * ============================================================
 *
 * CRUD de despesas do administrador:
 *   - create: Adiciona nova despesa
 *   - getAll: Lista todas as despesas
 *   - delete: Remove uma despesa
 *
 * Usado no relatório financeiro do painel admin.
 * Todas as rotas requerem autenticação + autorização ADMIN.
 *
 * Uso:
 *   import { ExpenseController } from '../controllers/ExpenseController';
 * ============================================================
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const ExpenseController = {
  /**
   * Cria uma nova despesa
   *
   * @route POST /expenses
   * @access Admin
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, value, date } = req.body;

      // ──── Validação ────
      if (!name || value === undefined) {
        res.status(400).json({
          error: 'Campos obrigatórios: name, value.',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      const expense = await prisma.expense.create({
        data: {
          name,
          value: parseFloat(value),
          date: date ? new Date(date) : new Date(),
        },
      });

      res.status(201).json({ expense });
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Lista todas as despesas
   *
   * @route GET /expenses
   * @access Admin
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' },
      });

      res.status(200).json({ expenses });
    } catch (error) {
      console.error('❌ Erro ao listar despesas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Remove uma despesa
   *
   * @route DELETE /expenses/:id
   * @access Admin
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const expense = await prisma.expense.findUnique({
        where: { id },
      });

      if (!expense) {
        res.status(404).json({
          error: 'Despesa não encontrada.',
          code: 'NOT_FOUND',
        });
        return;
      }

      await prisma.expense.delete({ where: { id } });

      res.status(200).json({ message: 'Despesa removida com sucesso.' });
    } catch (error) {
      console.error('❌ Erro ao deletar despesa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
