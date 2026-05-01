/**
 * ============================================================
 * types/index.ts — Tipagens TypeScript do App
 * ============================================================
 *
 * Aqui ficam todas as interfaces e tipos compartilhados
 * entre os componentes, telas e contextos do aplicativo.
 *
 * Manter as tipagens centralizadas evita duplicação e
 * facilita a manutenção quando o modelo de dados mudar.
 * ============================================================
 */

/**
 * Service — Representa um serviço de beleza oferecido
 *
 * Cada serviço tem um identificador único, nome, descrição,
 * preço em reais, duração em minutos e um emoji como ícone.
 */
export interface Service {
  /** Identificador único do serviço */
  id: string;

  /** Nome do serviço (ex: "Brow Lamination") */
  name: string;

  /** Descrição curta do serviço */
  description: string;

  /** Preço em reais (ex: 120.00) */
  price: number;

  /** Duração do serviço em minutos (ex: 60) */
  duration: number;

  /** Emoji representativo do serviço (ex: "✨") */
  icon: string;
}

/**
 * TimeSlot — Representa um horário disponível para agendamento
 *
 * Usado na grade de horários da tela de booking.
 */
export interface TimeSlot {
  /** Horário formatado (ex: "09:00") */
  time: string;

  /** Se o horário está disponível para agendamento */
  available: boolean;
}

/**
 * Appointment — Representa um agendamento marcado pelo usuário
 *
 * Armazena todas as informações de um agendamento realizado,
 * incluindo o serviço, data, horário e status atual.
 */
export interface Appointment {
  /** Identificador único do agendamento */
  id: string;

  /** Serviço agendado (referência completa) */
  service: Service;

  /** Data do agendamento no formato "YYYY-MM-DD" */
  date: string;

  /** Horário do agendamento (ex: "14:00") */
  time: string;

  /** Status atual do agendamento */
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
}

/**
 * Tipos de navegação — usados pelo React Navigation
 *
 * Definem os parâmetros aceitos por cada tela,
 * garantindo tipagem segura na navegação.
 */

/** Parâmetros das telas do Stack Navigator (Home) */
export type HomeStackParamList = {
  /** Tela inicial — sem parâmetros */
  HomeMain: undefined;

  /** Tela de agendamento — recebe o serviço selecionado */
  Booking: { service: Service };
};

/** Parâmetros das abas do Bottom Tab Navigator */
export type BottomTabParamList = {
  /** Aba Início (contém o Stack Navigator) */
  Home: undefined;

  /** Aba Meus Agendamentos */
  Appointments: undefined;

  /** Aba Perfil */
  Profile: undefined;
};

/** Parâmetros das telas de autenticação (AuthStack) */
export type AuthStackParamList = {
  /** Tela de Login */
  Login: undefined;
  /** Tela de Cadastro */
  Register: undefined;
};

/**
 * AuthUser — Dados do usuário autenticado
 *
 * Corresponde ao payload retornado pela API após login/registro.
 */
export interface AuthUser {
  /** ID único do usuário (UUID) */
  id: string;
  /** Nome completo */
  name: string;
  /** E-mail */
  email: string;
  /** Telefone */
  phone: string;
  /** Papel no sistema: CLIENT ou ADMIN */
  role: 'CLIENT' | 'ADMIN';
}
