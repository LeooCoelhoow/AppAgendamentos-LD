/**
 * ============================================================
 * context/AppointmentsContext.tsx — Contexto de Agendamentos
 * ============================================================
 *
 * Context API para gerenciar o estado global de agendamentos.
 * Agora integrado com o backend via API REST.
 *
 * Funcionalidades:
 * - appointments: Lista de agendamentos do usuário
 * - isLoading: Estado de carregamento
 * - addAppointment: Cria agendamento no backend e atualiza estado
 * - fetchAppointments: Recarrega agendamentos da API
 * - confirmAppointment: Cliente confirma presença
 *
 * O Provider deve envolver toda a árvore de componentes
 * no App.tsx para que todas as telas tenham acesso.
 * ============================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { ApiAppointment } from '../types';
import { useAuth } from './AuthContext';
import {
  createAppointmentAPI,
  getMyAppointmentsAPI,
  getAvailableSlotsAPI,
  clientConfirmAppointmentAPI,
  clientCancelAppointmentAPI,
} from '../services/api';

/**
 * Tipagem do contexto
 */
interface AppointmentsContextType {
  /** Lista de agendamentos do usuário (formato API) */
  appointments: ApiAppointment[];

  /** Se está carregando os agendamentos */
  isLoading: boolean;

  /** Horários disponíveis para a data/serviço selecionado */
  availableSlots: string[];

  /** Se está carregando os horários disponíveis */
  isSlotsLoading: boolean;

  /** Busca horários disponíveis para uma data e serviço */
  fetchAvailableSlots: (date: string, serviceId: string) => Promise<void>;

  /** Cria um novo agendamento no backend */
  addAppointment: (data: {
    serviceId: string;
    date: string;
    time: string;
  }) => Promise<ApiAppointment>;

  /** Recarrega os agendamentos da API */
  fetchAppointments: () => Promise<void>;

  /** Cliente confirma presença no agendamento */
  confirmAppointment: (id: string) => Promise<void>;

  /** Cliente cancela seu agendamento */
  cancelAppointment: (id: string) => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
);

interface AppointmentsProviderProps {
  children: ReactNode;
}

/**
 * AppointmentsProvider — Componente Provider do Contexto
 *
 * Busca os agendamentos da API ao montar e fornece funções
 * para criar e confirmar agendamentos.
 */
export function AppointmentsProvider({ children }: AppointmentsProviderProps) {
  const { token, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  /**
   * Busca os agendamentos do usuário logado
   */
  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await getMyAppointmentsAPI(token);
      setAppointments(response.appointments);
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Busca agendamentos quando o usuário está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [isAuthenticated, token, fetchAppointments]);

  /**
   * Busca horários disponíveis para uma data e serviço
   */
  const fetchAvailableSlots = useCallback(
    async (date: string, serviceId: string) => {
      if (!token) return;
      try {
        setIsSlotsLoading(true);
        const response = await getAvailableSlotsAPI(token, date, serviceId);
        setAvailableSlots(response.availableSlots);
      } catch (error) {
        console.error('❌ Erro ao buscar horários disponíveis:', error);
        setAvailableSlots([]);
      } finally {
        setIsSlotsLoading(false);
      }
    },
    [token]
  );

  /**
   * Cria um novo agendamento no backend
   */
  const addAppointment = async (data: {
    serviceId: string;
    date: string;
    time: string;
  }): Promise<ApiAppointment> => {
    if (!token) throw new Error('Usuário não autenticado.');

    const response = await createAppointmentAPI(token, data);
    // Atualiza a lista local
    await fetchAppointments();
    return response.appointment;
  };

  /**
   * Cliente confirma presença no agendamento
   */
  const confirmAppointment = async (id: string): Promise<void> => {
    if (!token) throw new Error('Usuário não autenticado.');

    await clientConfirmAppointmentAPI(token, id);
    // Anima a atualização da lista
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await fetchAppointments();
  };

  /**
   * Cliente cancela o agendamento
   */
  const cancelAppointment = async (id: string): Promise<void> => {
    if (!token) throw new Error('Usuário não autenticado.');

    await clientCancelAppointmentAPI(token, id);
    // Anima a atualização da lista
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await fetchAppointments();
  };

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        availableSlots,
        isSlotsLoading,
        fetchAvailableSlots,
        addAppointment,
        fetchAppointments,
        confirmAppointment,
        cancelAppointment,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

/**
 * useAppointments — Hook customizado para consumir o contexto
 *
 * @returns O contexto com appointments e funções
 * @throws Error se usado fora do Provider
 */
export function useAppointments(): AppointmentsContextType {
  const context = useContext(AppointmentsContext);

  if (!context) {
    throw new Error(
      'useAppointments deve ser usado dentro de um <AppointmentsProvider>. ' +
      'Verifique se o Provider está envolvendo a árvore de componentes no App.tsx.'
    );
  }

  return context;
}
