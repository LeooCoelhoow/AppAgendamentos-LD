/**
 * ============================================================
 * services/api.ts — Serviço de Comunicação com o Backend
 * ============================================================
 *
 * Centraliza todas as chamadas HTTP para a API REST.
 * Usa fetch nativo com headers JSON e inclusão automática
 * do token JWT quando disponível.
 *
 * Configuração:
 *   - API_BASE_URL: URL do servidor Express
 *     • Android Emulator: http://10.0.2.2:3333
 *     • iOS Simulator: http://localhost:3333
 *     • Dispositivo físico: http://<IP-LOCAL>:3333
 *
 * Funções:
 *   Autenticação:
 *     - loginAPI(email, password) — Autentica o usuário
 *     - registerAPI(name, email, phone, password) — Cadastra
 *     - getProfileAPI(token) — Retorna o perfil autenticado
 *     - updateProfileAPI(token, data) — Atualiza o perfil
 *
 *   Agendamentos:
 *     - createAppointmentAPI(token, data) — Cria agendamento
 *     - getMyAppointmentsAPI(token) — Lista agendamentos do cliente
 *     - clientConfirmAppointmentAPI(token, id) — Cliente confirma
 *     - getAllAppointmentsAPI(token) — Admin lista todos
 *     - adminConfirmAppointmentAPI(token, id) — Admin finaliza
 *     - cancelAppointmentAPI(token, id) — Admin cancela
 *
 *   Despesas:
 *     - createExpenseAPI(token, data) — Cria despesa
 *     - getExpensesAPI(token) — Lista despesas
 *     - deleteExpenseAPI(token, id) — Remove despesa
 *
 *   Relatórios:
 *     - getFinancialReportAPI(token, period) — Relatório financeiro
 *
 * Uso:
 *   import { loginAPI } from '../services/api';
 *   const { user, token } = await loginAPI(email, password);
 * ============================================================
 */

import { Platform } from 'react-native';
import { ApiAppointment, Expense, FinancialReport } from '../types';

/**
 * URL base da API
 *
 * O Android Emulator usa 10.0.2.2 para acessar o localhost
 * da máquina host. No iOS e web, usa localhost normalmente.
 *
 * ⚠️ Se estiver testando em dispositivo físico, substitua
 *    por o IP real da sua máquina na rede local.
 *    Ex: http://192.168.1.100:3333
 */
// Puxa a variável de ambiente se estiver em produção (Vercel)
// Caso contrário (desenvolvimento local), usa as configurações do localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:3333',
  ios: 'http://localhost:3333',
  default: 'http://localhost:3333',
});

/**
 * Interface do usuário retornado pela API
 */
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'ADMIN';
}

/**
 * Interface da resposta de autenticação (login/register)
 */
interface AuthResponse {
  user: ApiUser;
  token: string;
}

/**
 * Função helper para fazer requisições HTTP
 *
 * Adiciona automaticamente os headers JSON e o token
 * de autenticação quando fornecido.
 *
 * @param endpoint - Caminho da rota (ex: '/auth/login')
 * @param options - Opções do fetch (method, body, etc)
 * @param token - Token JWT opcional para rotas protegidas
 * @returns Dados da resposta parseados como JSON
 * @throws Error com mensagem da API se status não for ok
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  // Monta os headers com JSON e token opcional
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Faz a requisição HTTP
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  // Tenta parsear a resposta como JSON
  const data = await response.json();

  // Se a resposta não for ok, lança um erro com a mensagem da API
  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição.');
  }

  return data as T;
}

// ──────────────────────────────────────────────
// Funções da API — Autenticação
// ──────────────────────────────────────────────

/**
 * Realiza o login do usuário
 *
 * @param email - E-mail do usuário
 * @param password - Senha do usuário
 * @returns Dados do usuário + token JWT
 */
export async function loginAPI(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Cadastra um novo usuário
 *
 * @param name - Nome completo
 * @param email - E-mail
 * @param phone - Telefone
 * @param password - Senha
 * @returns Dados do usuário criado + token JWT
 */
export async function registerAPI(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  });
}

// ──────────────────────────────────────────────
// Funções da API — Perfil do Usuário
// ──────────────────────────────────────────────

/**
 * Retorna o perfil do usuário autenticado
 *
 * @param token - Token JWT
 * @returns Dados do perfil
 */
export async function getProfileAPI(
  token: string
): Promise<{ user: ApiUser }> {
  return apiRequest<{ user: ApiUser }>('/users/me', {
    method: 'GET',
  }, token);
}

/**
 * Atualiza o perfil do usuário
 *
 * @param token - Token JWT
 * @param data - Campos para atualizar (name, email, phone)
 * @returns Dados atualizados do perfil
 */
export async function updateProfileAPI(
  token: string,
  data: Partial<Pick<ApiUser, 'name' | 'email' | 'phone'>>
): Promise<{ user: ApiUser }> {
  return apiRequest<{ user: ApiUser }>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
}

// ──────────────────────────────────────────────
// Funções da API — Agendamentos
// ──────────────────────────────────────────────

/**
 * Cria um novo agendamento no banco de dados
 *
 * @param token - Token JWT
 * @param data - Dados do agendamento (serviceId, date, time)
 * @returns Agendamento criado
 */
export async function createAppointmentAPI(
  token: string,
  data: { serviceId: string; date: string; time: string }
): Promise<{ appointment: ApiAppointment }> {
  return apiRequest<{ appointment: ApiAppointment }>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

/**
 * Lista os agendamentos do cliente logado
 *
 * @param token - Token JWT
 * @returns Lista de agendamentos do usuário
 */
export async function getMyAppointmentsAPI(
  token: string
): Promise<{ appointments: ApiAppointment[] }> {
  return apiRequest<{ appointments: ApiAppointment[] }>('/appointments/my', {
    method: 'GET',
  }, token);
}

/**
 * Obtém horários disponíveis para uma data e serviço
 *
 * @param token - Token JWT
 * @param date - Data no formato YYYY-MM-DD
 * @param serviceId - ID do serviço
 * @returns Array de horários disponíveis
 */
export async function getAvailableSlotsAPI(
  token: string,
  date: string,
  serviceId: string
): Promise<{ availableSlots: string[] }> {
  return apiRequest<{ availableSlots: string[] }>(
    `/appointments/available-slots?date=${date}&serviceId=${serviceId}`,
    { method: 'GET' },
    token
  );
}

/**
 * Cliente confirma presença no agendamento
 *
 * @param token - Token JWT
 * @param id - ID do agendamento
 * @returns Agendamento atualizado
 */
export async function clientConfirmAppointmentAPI(
  token: string,
  id: string
): Promise<{ appointment: ApiAppointment }> {
  return apiRequest<{ appointment: ApiAppointment }>(
    `/appointments/${id}/client-confirm`,
    { method: 'PATCH' },
    token
  );
}

/**
 * Cliente cancela seu próprio agendamento
 *
 * @param token - Token JWT
 * @param id - ID do agendamento
 * @returns Agendamento cancelado
 */
export async function clientCancelAppointmentAPI(
  token: string,
  id: string
): Promise<{ appointment: ApiAppointment }> {
  return apiRequest<{ appointment: ApiAppointment }>(
    `/appointments/${id}/client-cancel`,
    { method: 'PATCH' },
    token
  );
}

/**
 * Admin lista TODOS os agendamentos
 *
 * @param token - Token JWT (admin)
 * @returns Todos os agendamentos com dados do cliente
 */
export async function getAllAppointmentsAPI(
  token: string
): Promise<{ appointments: ApiAppointment[] }> {
  return apiRequest<{ appointments: ApiAppointment[] }>('/appointments/all', {
    method: 'GET',
  }, token);
}

/**
 * Admin confirma/finaliza atendimento
 *
 * @param token - Token JWT (admin)
 * @param id - ID do agendamento
 * @returns Agendamento atualizado
 */
export async function adminConfirmAppointmentAPI(
  token: string,
  id: string
): Promise<{ appointment: ApiAppointment }> {
  return apiRequest<{ appointment: ApiAppointment }>(
    `/appointments/${id}/admin-confirm`,
    { method: 'PATCH' },
    token
  );
}

/**
 * Admin cancela um agendamento
 *
 * @param token - Token JWT (admin)
 * @param id - ID do agendamento
 * @returns Agendamento atualizado
 */
export async function cancelAppointmentAPI(
  token: string,
  id: string
): Promise<{ appointment: ApiAppointment }> {
  return apiRequest<{ appointment: ApiAppointment }>(
    `/appointments/${id}/cancel`,
    { method: 'PATCH' },
    token
  );
}

// ──────────────────────────────────────────────
// Funções da API — Despesas (Admin)
// ──────────────────────────────────────────────

/**
 * Admin cria uma nova despesa
 *
 * @param token - Token JWT (admin)
 * @param data - Nome e valor da despesa
 * @returns Despesa criada
 */
export async function createExpenseAPI(
  token: string,
  data: { name: string; value: number }
): Promise<{ expense: Expense }> {
  return apiRequest<{ expense: Expense }>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

/**
 * Admin lista todas as despesas
 *
 * @param token - Token JWT (admin)
 * @returns Lista de despesas
 */
export async function getExpensesAPI(
  token: string
): Promise<{ expenses: Expense[] }> {
  return apiRequest<{ expenses: Expense[] }>('/expenses', {
    method: 'GET',
  }, token);
}

/**
 * Admin remove uma despesa
 *
 * @param token - Token JWT (admin)
 * @param id - ID da despesa
 * @returns Mensagem de sucesso
 */
export async function deleteExpenseAPI(
  token: string,
  id: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/expenses/${id}`, {
    method: 'DELETE',
  }, token);
}

// ──────────────────────────────────────────────
// Funções da API — Relatórios (Admin)
// ──────────────────────────────────────────────

/**
 * Busca o relatório financeiro
 *
 * @param token - Token JWT (admin)
 * @param period - Filtro de período: 'thisMonth', 'lastMonth' ou 'all'
 * @returns Dados completos do relatório financeiro
 */
export async function getFinancialReportAPI(
  token: string,
  period: 'thisMonth' | 'lastMonth' | 'all' = 'all'
): Promise<FinancialReport> {
  return apiRequest<FinancialReport>(
    `/reports/financial?period=${period}`,
    { method: 'GET' },
    token
  );
}
