/**
 * ============================================================
 * App.tsx — Ponto de Entrada do Aplicativo
 * ============================================================
 *
 * Este é o componente raiz do app. Ele configura:
 *
 * 1. AuthProvider — Context Provider de autenticação que
 *    gerencia login, registro, logout e token JWT.
 *
 * 2. AppointmentsProvider — Context Provider que compartilha
 *    o estado de agendamentos entre todas as telas.
 *
 * 3. NavigationContainer — container principal do React Navigation.
 *
 * 4. Navegação condicional:
 *    - Se NÃO autenticado → AuthStack (Login/Register)
 *    - Se autenticado → BottomTabs (Home/Appointments/Profile)
 *    - Enquanto verifica token → Tela de loading
 *
 * Hierarquia de componentes:
 * App
 *   └── AuthProvider (Context de Autenticação)
 *         └── AppointmentsProvider (Context de Agendamentos)
 *               └── NavigationContainer
 *                     ├── AuthStack (se !isAuthenticated)
 *                     │     ├── LoginScreen
 *                     │     └── RegisterScreen
 *                     └── BottomTabs (se isAuthenticated)
 *                           ├── HomeStackNavigator
 *                           │     ├── HomeScreen
 *                           │     └── BookingScreen
 *                           ├── AppointmentsScreen
 *                           └── ProfileScreen
 * ============================================================
 */

import React from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppointmentsProvider } from './context/AppointmentsContext';
import BottomTabs from './navigation/BottomTabs';
import AuthStack from './navigation/AuthStack';
import { Colors } from './theme/colors';

/**
 * AppContent — Componente interno que usa o AuthContext
 *
 * Precisa estar dentro do AuthProvider para acessar
 * os dados de autenticação via useAuth().
 *
 * Renderiza:
 * - Loading spinner enquanto verifica token
 * - AuthStack se não autenticado
 * - BottomTabs se autenticado
 */
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // ──── Tela de Loading (verificando token salvo) ────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {isAuthenticated ? (
        /* Usuário autenticado — mostra as abas principais */
        <AppointmentsProvider>
          <BottomTabs />
        </AppointmentsProvider>
      ) : (
        /* Usuário não autenticado — mostra Login/Register */
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

/**
 * App — Componente raiz
 *
 * Envolve tudo com o AuthProvider para que o AppContent
 * e todos os componentes filhos tenham acesso ao contexto.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
