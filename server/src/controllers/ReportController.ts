/**
 * ============================================================
 * controllers/ReportController.ts — Controlador do Relatório Financeiro
 * ============================================================
 *
 * Gera o relatório financeiro com:
 *   - Receita total (agendamentos COMPLETED com ambas confirmações)
 *   - Despesas totais
 *   - Lucro líquido (receita - despesas)
 *   - Lista de receitas detalhada
 *   - Lista de despesas detalhada
 *
 * Suporta filtros por período:
 *   - thisMonth: Este mês
 *   - lastMonth: Último mês
 *   - all: Todo o período (padrão)
 *
 * Todas as rotas requerem autenticação + autorização ADMIN.
 *
 * Uso:
 *   import { ReportController } from '../controllers/ReportController';
 * ============================================================
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Retorna as datas de início e fim do período solicitado
 *
 * @param period - 'thisMonth', 'lastMonth' ou 'all'
 * @returns Objeto com startDate e endDate (ou undefined para 'all')
 */
function getDateRange(period: string): { startDate?: Date; endDate?: Date } {
  const now = new Date();

  if (period === 'thisMonth') {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === 'lastMonth') {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // 'all' — sem filtro de data
  return {};
}

export const ReportController = {
  /**
   * Gera o relatório financeiro
   *
   * Query params:
   *   ?period=thisMonth | lastMonth | all
   *
   * @route GET /reports/financial
   * @access Admin
   */
  async getFinancial(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || 'all';
      const { startDate, endDate } = getDateRange(period);

      // Filtro de data condicional
      const dateFilter = startDate && endDate
        ? { gte: startDate, lte: endDate }
        : undefined;

      // ──── Receitas: agendamentos COMPLETED (ambas confirmações) ────
      const completedAppointments = await prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          clientConfirmed: true,
          adminConfirmed: true,
          ...(dateFilter ? { date: dateFilter } : {}),
        },
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { date: 'desc' },
      });

      const totalRevenue = completedAppointments.reduce(
        (sum, apt) => sum + apt.price,
        0
      );

      // ──── Despesas ────
      const expenses = await prisma.expense.findMany({
        where: dateFilter ? { date: dateFilter } : {},
        orderBy: { date: 'desc' },
      });

      const totalExpenses = expenses.reduce(
        (sum, exp) => sum + exp.value,
        0
      );

      // ──── Lucro Líquido ────
      const netProfit = totalRevenue - totalExpenses;

      res.status(200).json({
        period,
        totalRevenue,
        totalExpenses,
        netProfit,
        revenueItems: completedAppointments.map((apt) => ({
          id: apt.id,
          service: apt.service,
          clientName: apt.user.name,
          price: apt.price,
          date: apt.date,
        })),
        expenseItems: expenses,
      });
    } catch (error) {
      console.error('❌ Erro ao gerar relatório financeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
