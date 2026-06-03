/**
 * ============================================================
 * controllers/AppointmentController.ts — Controlador de Agendamentos
 * ============================================================
 *
 * CRUD completo de agendamentos:
 *   - create: Cliente cria novo agendamento
 *   - getMyAppointments: Cliente lista seus agendamentos
 *   - clientConfirm: Cliente confirma presença
 *   - getAll: Admin lista TODOS os agendamentos
 *   - adminConfirm: Admin finaliza atendimento
 *   - cancel: Admin cancela agendamento
 *
 * Regra de negócio principal:
 *   O lucro só é contabilizado quando AMBAS as confirmações
 *   (clientConfirmed + adminConfirmed) forem true.
 *   Nesse momento o status muda para COMPLETED.
 *
 * Uso:
 *   import { AppointmentController } from '../controllers/AppointmentController';
 * ============================================================
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const AppointmentController = {
  /**
   * Cria um novo agendamento
   *
   * @route POST /appointments
   * @access Autenticado (qualquer usuário)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { service, date, time, price } = req.body;

      // ──── Validação básica ────
      if (!service || !date || !time || price === undefined) {
        res.status(400).json({
          error: 'Campos obrigatórios: service, date, time, price.',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      // ──── Cria o agendamento no banco ────
      const appointment = await prisma.appointment.create({
        data: {
          userId: req.userId!,
          service,
          date: new Date(date),
          time,
          price: parseFloat(price),
          status: 'PENDING',
          clientConfirmed: false,
          adminConfirmed: false,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      res.status(201).json({ appointment });
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Lista os agendamentos do usuário logado
   *
   * @route GET /appointments/my
   * @access Autenticado (cliente)
   */
  async getMyAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
      });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Cliente confirma presença no agendamento
   *
   * Marca clientConfirmed = true.
   * Se o admin já confirmou, muda status para COMPLETED.
   *
   * @route PATCH /appointments/:id/client-confirm
   * @access Autenticado (dono do agendamento)
   */
  async clientConfirm(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Busca o agendamento e verifica se pertence ao usuário
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        res.status(404).json({
          error: 'Agendamento não encontrado.',
          code: 'NOT_FOUND',
        });
        return;
      }

      if (appointment.userId !== req.userId) {
        res.status(403).json({
          error: 'Você não tem permissão para confirmar este agendamento.',
          code: 'FORBIDDEN',
        });
        return;
      }

      // Determina o novo status
      const newStatus = appointment.adminConfirmed ? 'COMPLETED' : appointment.status;

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          clientConfirmed: true,
          status: newStatus,
        },
      });

      res.status(200).json({ appointment: updated });
    } catch (error) {
      console.error('❌ Erro ao confirmar agendamento (cliente):', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Admin lista TODOS os agendamentos (com dados do cliente)
   *
   * Ordenados do mais recente para o mais antigo.
   *
   * @route GET /appointments/all
   * @access Admin
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany({
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error('❌ Erro ao listar todos os agendamentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Admin confirma/finaliza atendimento
   *
   * Marca adminConfirmed = true.
   * Se a cliente já confirmou, muda status para COMPLETED
   * e o valor entra no relatório financeiro como receita.
   *
   * @route PATCH /appointments/:id/admin-confirm
   * @access Admin
   */
  async adminConfirm(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        res.status(404).json({
          error: 'Agendamento não encontrado.',
          code: 'NOT_FOUND',
        });
        return;
      }

      // Determina o novo status
      const newStatus = appointment.clientConfirmed ? 'COMPLETED' : 'CONFIRMED';

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          adminConfirmed: true,
          status: newStatus,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      res.status(200).json({ appointment: updated });
    } catch (error) {
      console.error('❌ Erro ao confirmar agendamento (admin):', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Admin cancela um agendamento
   *
   * @route PATCH /appointments/:id/cancel
   * @access Admin
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        res.status(404).json({
          error: 'Agendamento não encontrado.',
          code: 'NOT_FOUND',
        });
        return;
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      res.status(200).json({ appointment: updated });
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  /**
   * Cliente cancela seu próprio agendamento
   *
   * Verifica se o agendamento pertence ao usuário e se ainda
   * não foi concluído ou cancelado antes de permitir o cancelamento.
   *
   * @route PATCH /appointments/:id/client-cancel
   * @access Autenticado (dono do agendamento)
   */
  async clientCancel(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Busca o agendamento
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        res.status(404).json({
          error: 'Agendamento não encontrado.',
          code: 'NOT_FOUND',
        });
        return;
      }

      // Verifica se o agendamento pertence ao usuário
      if (appointment.userId !== req.userId) {
        res.status(403).json({
          error: 'Você não tem permissão para cancelar este agendamento.',
          code: 'FORBIDDEN',
        });
        return;
      }

      // Verifica se o agendamento já foi concluído ou cancelado
      if (appointment.status === 'COMPLETED') {
        res.status(400).json({
          error: 'Não é possível cancelar um atendimento já concluído.',
          code: 'ALREADY_COMPLETED',
        });
        return;
      }

      if (appointment.status === 'CANCELLED') {
        res.status(400).json({
          error: 'Este agendamento já foi cancelado.',
          code: 'ALREADY_CANCELLED',
        });
        return;
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      res.status(200).json({ appointment: updated });
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento (cliente):', error);
      res.status(500).json({
        error: 'Erro interno do servidor.',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
