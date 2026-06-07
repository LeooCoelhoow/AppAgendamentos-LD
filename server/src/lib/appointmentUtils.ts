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
 *
 * @param date - Data no formato YYYY-MM-DD
 */
export async function getBookedSlots(date: string): Promise<
  Array<{ time: string; durationMinutes: number }>
> {
  // CORREÇÃO: Força a criação das datas limite em UTC para bater perfeitamente com o Prisma
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
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
 * (Versão blindada com conversão rigorosa de Números para cálculo matemático)
 */
export async function isSlotAvailable(
  date: string,
  time: string,
  durationMinutes: number,
  preloadedBookedSlots?: Array<{ time: string; durationMinutes: number }>
): Promise<boolean> {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    // OBTENÇÃO DOS OCUPADOS
    const bookedSlots = preloadedBookedSlots || await getBookedSlots(date);

    // CONVERSÃO RIGOROSA: Força que a duração recebida seja um Número inteiro
    const reqDuration = Number(durationMinutes) || 0;
    const requestedStartMinutes = hours * 60 + minutes;
    const requestedEndMinutes = requestedStartMinutes + reqDuration;

    // VERIFICAÇÃO DE CONFLITO COM HORÁRIOS OCUPADOS
    for (const slot of bookedSlots) {
      const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
      
      // Força a duração do banco a ser um Número inteiro
      const slotDuration = Number(slot.durationMinutes) || 0;
      
      const slotStartMinutes = slotHours * 60 + slotMinutes;
      const slotEndMinutes = slotStartMinutes + slotDuration;

      // LÓGICA MATEMÁTICA DE SOBREPOSIÇÃO:
      // Se o início desejado for ANTES do término do agendamento existente
      // E o término desejado for DEPOIS do início do agendamento existente, há conflito!
      if (
        requestedStartMinutes < slotEndMinutes &&
        requestedEndMinutes > slotStartMinutes
      ) {
        return false; // Conflito real detectado! Bloqueia o horário.
      }
    }

    // VERIFICAÇÃO DE HORÁRIO DE FUNCIONAMENTO
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day); 
    const dayOfWeek = (dateObj.getDay() + 6) % 7;

    if (dayOfWeek === 6) return false;

    const workingHours = await prisma.workingHours.findFirst({
      where: { dayOfWeek, isOpen: true },
    });

    if (!workingHours) return false; 

    const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
    const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

    const startMinutesWork = startHours * 60 + startMinutes;
    const endMinutesWork = endHours * 60 + endMinutes;

    // Verifica se o tempo total do serviço cabe dentro do expediente do salão
    if (requestedStartMinutes < startMinutesWork) return false; 
    if (requestedEndMinutes > endMinutesWork) return false; 

    return true; 
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}

/**
 * Gera array de horários disponíveis para uma data específica
 */
export async function getAvailableSlots(
  date: string,
  durationMinutes: number
): Promise<string[]> {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; 

    if (dayOfWeek === 6) {
      return [];
    }

    const workingHours = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek,
        isOpen: true,
      },
    });

    if (!workingHours) {
      return []; 
    }

    // OTIMIZAÇÃO: Busca os slots ocupados APENAS UMA VEZ
    const bookedSlots = await getBookedSlots(date);

    const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
    const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

    const startMinutesWork = startHours * 60 + startMinutes;
    const endMinutesWork = endHours * 60 + endMinutes;

    const slots: string[] = [];
    for (let m = startMinutesWork; m <= endMinutesWork - durationMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      slots.push(timeStr);
    }

    const availableSlots: string[] = [];
    for (const slot of slots) {
      // Passamos o bookedSlots que já buscamos, aliviando o banco de dados
      const available = await isSlotAvailable(date, slot, durationMinutes, bookedSlots);
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