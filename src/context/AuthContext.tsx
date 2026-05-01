/**
 * ============================================================
 * context/AuthContext.tsx — Contexto de Autenticação
 * ============================================================
 *
 * Gerencia o estado global de autenticação do app:
 *   - user: Dados do usuário logado
 *   - token: JWT para requisições autenticadas
 *   - isLoading: Loading durante verificação de token
 *   - isAuthenticated: Se o usuário está logado
 *
 * Funções:
 *   - login(email, password): Autentica via API
 *   - register(name, email, phone, password): Cadastra via API
 *   - logout(): Remove token e limpa estado
 *
 * Persistência:
 *   - Token JWT é salvo no AsyncStorage
 *   - Na inicialização, verifica se existe token salvo
 *     e busca o perfil do usuário na API (auto-login)
 *
 * Uso:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 * ============================================================
 */

import React, {
  createContext, useContext, useState, useEffect, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginAPI, registerAPI, getProfileAPI, ApiUser,
} from '../services/api';

// ──── Chave do AsyncStorage para o token JWT ────
const TOKEN_KEY = '@AppAgendamentos:token';
const USER_KEY = '@AppAgendamentos:user';

/**
 * Tipagem do contexto de autenticação
 */
interface AuthContextType {
  /** Dados do usuário logado (null se não autenticado) */
  user: ApiUser | null;
  /** Token JWT (null se não autenticado) */
  token: string | null;
  /** Se está carregando (verificação de token na inicialização) */
  isLoading: boolean;
  /** Se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Faz login com e-mail e senha */
  login: (email: string, password: string) => Promise<void>;
  /** Registra novo usuário */
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  /** Faz logout e limpa o token */
  logout: () => Promise<void>;
}

/** Cria o contexto com valor inicial undefined */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider — Provider do contexto de autenticação
 *
 * Envolve a árvore de componentes e gerencia:
 * - Estado do usuário e token
 * - Auto-login na inicialização
 * - Persistência via AsyncStorage
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Auto-login: verifica token salvo na inicialização
   *
   * Se existe um token no AsyncStorage, tenta buscar
   * o perfil do usuário na API. Se o token for inválido
   * ou expirado, limpa os dados.
   */
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Tenta buscar o perfil com o token salvo
          try {
            const response = await getProfileAPI(storedToken);
            setUser(response.user);
            setToken(storedToken);
          } catch {
            // Token inválido/expirado — usa dados locais como fallback
            // ou limpa se preferir forçar re-login
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  /**
   * Login — autentica com e-mail e senha
   *
   * Chama a API, armazena token e dados do usuário
   * no estado e no AsyncStorage.
   */
  const login = async (email: string, password: string) => {
    const response = await loginAPI(email, password);
    setUser(response.user);
    setToken(response.token);

    // Persiste no AsyncStorage
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
  };

  /**
   * Register — cadastra novo usuário
   *
   * Chama a API de registro, armazena token e dados
   * do usuário. O usuário é logado automaticamente
   * após o cadastro.
   */
  const register = async (
    name: string, email: string, phone: string, password: string
  ) => {
    const response = await registerAPI(name, email, phone, password);
    setUser(response.user);
    setToken(response.token);

    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
  };

  /**
   * Logout — limpa a sessão
   *
   * Remove o token e dados do usuário do estado
   * e do AsyncStorage.
   */
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — Hook para consumir o contexto de autenticação
 *
 * @returns Dados e funções de autenticação
 * @throws Error se usado fora do AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de um <AuthProvider>. ' +
      'Verifique se o Provider está no App.tsx.'
    );
  }
  return context;
}
