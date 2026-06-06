/**
 * ============================================================
 * routes/appointment.routes.ts — Rotas de Agendamentos
 * ============================================================
 *
 * Rotas para gerenciamento de agendamentos:
 *
 * Rotas do Cliente (autenticado):
 *   POST   /appointments             — Criar agendamento
 *   GET    /appointments/my          — Listar meus agendamentos
 *   PATCH  /appointments/:id/client-confirm — Confirmar presença
 *
 * Rotas do Admin (autenticado + admin):
 *   GET    /appointments/all         — Listar TODOS os agendamentos
 *   PATCH  /appointments/:id/admin-confirm  — Finalizar atendimento
 *   PATCH  /appointments/:id/cancel         — Cancelar agendamento
 * ============================================================
 */

import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const appointmentRoutes = Router();

// ──── Todas as rotas requerem autenticação ────
appointmentRoutes.use(authMiddleware);

// ──── Rotas do Cliente ────

/** Obter horários disponíveis para uma data e serviço */
appointmentRoutes.get('/available-slots', AppointmentController.getAvailableSlots);

/** Criar um novo agendamento */
appointmentRoutes.post('/', AppointmentController.create);

/** Listar agendamentos do usuário logado */
appointmentRoutes.get('/my', AppointmentController.getMyAppointments);

/** Cliente confirma presença */
appointmentRoutes.patch('/:id/client-confirm', AppointmentController.clientConfirm);

/** Cliente cancela seu próprio agendamento */
appointmentRoutes.patch('/:id/client-cancel', AppointmentController.clientCancel);

// ──── Rotas do Admin ────

/** Admin lista todos os agendamentos */
appointmentRoutes.get('/all', adminMiddleware, AppointmentController.getAll);

/** Admin finaliza atendimento */
appointmentRoutes.patch('/:id/admin-confirm', adminMiddleware, AppointmentController.adminConfirm);

/** Admin cancela agendamento */
appointmentRoutes.patch('/:id/cancel', adminMiddleware, AppointmentController.cancel);

export { appointmentRoutes };
