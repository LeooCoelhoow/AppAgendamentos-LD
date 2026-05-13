/**
 * ============================================================
 * navigation/BottomTabs.tsx — Navegação por Abas (Bottom Tabs)
 * ============================================================
 *
 * Configura a navegação principal do app usando Bottom Tab
 * Navigator do React Navigation. Cada aba corresponde a uma
 * seção do app:
 *
 * - 🏠 Início (Home) — com Stack Navigator aninhado para
 *   permitir navegação Home → Booking
 * - 📋 Agendamentos — lista de agendamentos marcados
 * - 👤 Perfil — informações do usuário
 * - 🔑 Admin — painel administrativo (somente para ADMIN)
 *
 * Estrutura de navegação:
 * BottomTabs
 *   ├── Home (Stack Navigator)
 *   │     ├── HomeMain (HomeScreen)
 *   │     └── Booking (BookingScreen)
 *   ├── Appointments (AppointmentsScreen)
 *   ├── Profile (ProfileScreen)
 *   └── Admin (AdminTabs) ← Apenas para role ADMIN
 *         ├── AdminAppointments
 *         └── AdminFinancial
 *
 * O Stack Navigator dentro de Home permite que o usuário
 * navegue da HomeScreen para a BookingScreen sem perder
 * a tab bar na parte inferior.
 * ============================================================
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { BottomTabParamList, HomeStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

// ──── Importação das Telas ────
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminTabs from './AdminTabs';

// ──────────────────────────────────────────────
// Stack Navigator — Navegação dentro da aba Home
// ──────────────────────────────────────────────

/**
 * Cria o Stack Navigator para a aba Home.
 * Permite navegar de HomeScreen para BookingScreen
 * e voltar com o botão nativo de "back".
 */
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,    // Esconde o header nativo (usamos nosso Header customizado)
      }}
    >
      {/* Tela principal da aba Home */}
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />

      {/* Tela de agendamento (acessa ao clicar em um serviço) */}
      <HomeStack.Screen name="Booking" component={BookingScreen} />
    </HomeStack.Navigator>
  );
}

// ──────────────────────────────────────────────
// Bottom Tab Navigator — Navegação principal
// ──────────────────────────────────────────────

/**
 * Cria o Bottom Tab Navigator com 3-4 abas.
 */
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Componente de ícone customizado para as abas
 *
 * Renderiza um emoji centralizado com cor dinâmica
 * baseada no estado de foco (ativo/inativo).
 *
 * @param emoji - O emoji a ser renderizado
 * @param focused - Se a aba está selecionada (ativa)
 */
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function BottomTabs() {
  /** Acessa os dados do usuário para verificar se é ADMIN */
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,                      // Esconde o header nativo
        tabBarShowLabel: true,                   // Mostra o label das abas
        tabBarActiveTintColor: Colors.primary,   // Cor do texto ativo (rosa)
        tabBarInactiveTintColor: Colors.textSecondary,  // Cor do texto inativo (cinza)
        tabBarStyle: styles.tabBar,              // Estilo customizado da tab bar
        tabBarLabelStyle: styles.tabLabel,       // Estilo do label
      }}
    >
      {/* ──── Aba 1: Início ──── */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}          // Stack Navigator aninhado
        options={{
          tabBarLabel: 'Início',                // Label da aba em português
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />

      {/* ──── Aba 2: Agendamentos ──── */}
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarLabel: 'Agendamentos',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
        }}
      />

      {/* ──── Aba 3: Perfil ──── */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />

      {/* ──── Aba 4: Admin (apenas para ADMIN) ──── */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminTabs}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🔑" focused={focused} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

/**
 * Estilos da navegação
 *
 * Tab bar com fundo branco, borda superior rosa sutil,
 * altura confortável e bordas arredondadas no topo.
 */
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,             // Fundo branco
    borderTopWidth: 1,                           // Borda superior fina
    borderTopColor: Colors.border,               // Rosa sutil
    height: 70,                                  // Altura confortável
    paddingBottom: 5,                           // Padding inferior
    paddingTop: 8,                               // Padding superior
    // Sombra sutil acima da tab bar (iOS)
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,                                // Sombra (Android)
  },
  tabLabel: {
    fontSize: 11,                                // Label pequeno
    fontWeight: '600',                           // Semi-bold
    marginTop: 2,                                // Espaço acima do label
  },
  tabIconContainer: {
    width: 36,                                   // Container do ícone
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabIconFocused: {
    backgroundColor: Colors.accent,              // Fundo rosa pastel quando ativo
    borderRadius: 10,
    transform: [{ scale: 1.1 }],                 // Leve escala quando selecionado
  },
  tabEmoji: {
    fontSize: 18,                                // Tamanho do emoji do ícone
  },
});
