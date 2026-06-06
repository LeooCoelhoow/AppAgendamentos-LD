/**
 * ============================================================
 * appointmentUtils.ts — Utilitários para gerenciar agendamentos
 * ============================================================
 *
 * Funções auxiliares para:
 * - Verificar disponibilidade de horários
 * - Listar horários ocupados
 * - Buscar horário de funcionamento
 * - Validar se um slot está disponível considerando duração
 */

import { Status } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Retorna todos os horários ocupados (bloqueados) para uma data específica
 *
 * Considera agendamentos com status PENDING e CONFIRMED como "ocupados"
 * Retorna um array com início e fim de cada agendamento ocupado
 *
 * @param date - Data no formato YYYY-MM-DD
 * @returns Array com { startTime, endTime, durationMinutes } de cada agendamento
 */
export async function getBookedSlots(date: string): Promise<
  Array<{ time: string; durationMinutes: number }>
> {
  const dateObj = new Date(`${date}T00:00:00`);

  // Buscar agendamentos ocupados naquela data
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date(dateObj),
        lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000), // Próximas 24h
      },
      status: {
        in: [Status.PENDING, Status.CONFIRMED],
      },
    },
    select: {
      time: true,
      service: {
        select: {
          durationMinutes: true,
        },
      },
    },
  });

  return appointments.map((apt) => ({
    time: apt.time,
    durationMinutes: apt.service.durationMinutes,
  }));
}

/**
 * Verifica se um horário específico está disponível para um serviço
 *
 * Considera:
 * - Horários já ocupados na data
 * - Duração do serviço
 * - Horário de funcionamento do dia
 *
 * @param date - Data no formato YYYY-MM-DD
 * @param time - Horário no formato HH:00
 * @param durationMinutes - Duração do serviço em minutos
 * @returns true se disponível, false caso contrário
 */
export async function isSlotAvailable(
  date: string,
  time: string,
  durationMinutes: number
): Promise<boolean> {
  try {
    // Validar formato do horário
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    // Obter horários ocupados naquela data
    const bookedSlots = await getBookedSlots(date);

    // Converter tempo do agendamento para minutos
    const requestedStartMinutes = hours * 60 + minutes;
    const requestedEndMinutes = requestedStartMinutes + durationMinutes;

    // Verificar se há conflito com horários ocupados
    for (const slot of bookedSlots) {
      const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
      const slotStartMinutes = slotHours * 60 + slotMinutes;
      const slotEndMinutes = slotStartMinutes + slot.durationMinutes;

      // Verificar sobreposição
      if (
        requestedStartMinutes < slotEndMinutes &&
        requestedEndMinutes > slotStartMinutes
      ) {
        return false; // Há conflito
      }
    }

    // Verificar se está dentro do horário de funcionamento
    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // 0 = Segunda, ..., 5 = Sábado

    // Domingo (6) não funciona
    if (dayOfWeek === 6) {
      return false;
    }

    // Buscar horário de funcionamento para o dia (usar admin padrão para agora)
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        isOpen: true,
      },
    });

    if (!workingHours) {
      return false; // Dia fechado
    }

    // Verificar se está dentro do horário de funcionamento
    const [startHours, startMinutes] = workingHours.startTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

    const startMinutesWork = startHours * 60 + startMinutes;
    const endMinutesWork = endHours * 60 + endMinutes;

    if (requestedStartMinutes < startMinutesWork) {
      return false; // Antes do horário de funcionamento
    }

    if (requestedEndMinutes > endMinutesWork) {
      return false; // Depois do horário de funcionamento
    }

    return true; // Horário disponível
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}

/**
 * Gera array de horários disponíveis para uma data específica
 *
 * Gera slots de 30 em 30 minutos considerando:
 * - Horário de funcionamento do dia
 * - Duração do serviço
 * - Horários já ocupados
 *
 * @param date - Data no formato YYYY-MM-DD
 * @param durationMinutes - Duração do serviço em minutos
 * @returns Array com horários disponíveis no formato HH:00
 */
export async function getAvailableSlots(
  date: string,
  durationMinutes: number
): Promise<string[]> {
  try {
    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // 0 = Segunda, ..., 5 = Sábado

    // Domingo (6) não funciona
    if (dayOfWeek === 6) {
      return [];
    }

    // Buscar horário de funcionamento para o dia
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        isOpen: true,
      },
    });

    if (!workingHours) {
      return []; // Dia fechado
    }

    const [startHours, startMinutes] = workingHours.startTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

    const startMinutesWork = startHours * 60 + startMinutes;
    const endMinutesWork = endHours * 60 + endMinutes;

    // Gerar slots de 30 em 30 minutos
    const slots: string[] = [];
    for (let m = startMinutesWork; m <= endMinutesWork - durationMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      slots.push(timeStr);
    }

    // Filtrar apenas slots disponíveis
    const availableSlots: string[] = [];
    for (const slot of slots) {
      const available = await isSlotAvailable(date, slot, durationMinutes);
      if (available) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Erro ao gerar slots disponíveis:', error);
    return [];
  }
}

/**
 * Retorna o horário de funcionamento para um dia específico
 *
 * @param dayOfWeek - Dia da semana (0 = Segunda, ..., 5 = Sábado)
 * @returns { startTime, endTime, isOpen } ou null se não encontrado
 */
export async function getWorkingHours(dayOfWeek: number) {
  return prisma.workingHours.findFirst({
    where: { dayOfWeek },
    select: {
      startTime: true,
      endTime: true,
      isOpen: true,
    },
  });
}

/**
 * Busca um serviço pelo ID
 *
 * @param serviceId - ID do serviço
 * @returns Dados do serviço ou null
 */
export async function getServiceById(serviceId: string) {
  return prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      price: true,
      durationMinutes: true,
    },
  });
}
