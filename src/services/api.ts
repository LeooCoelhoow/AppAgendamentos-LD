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
 *   - loginAPI(email, password) — Autentica o usuário
 *   - registerAPI(name, email, phone, password) — Cadastra
 *   - getProfileAPI(token) — Retorna o perfil autenticado
 *   - updateProfileAPI(token, data) — Atualiza o perfil
 *
 * Uso:
 *   import { loginAPI } from '../services/api';
 *   const { user, token } = await loginAPI(email, password);
 * ============================================================
 */

import { Platform } from 'react-native';

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
const API_BASE_URL = Platform.select({
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
