/**
 * ============================================================
 * navigation/AdminTabs.tsx — Navegação do Painel Admin
 * ============================================================
 *
 * Material Top Tab Navigator para o painel admin com duas abas:
 *   📋 Agendamentos — AdminAppointmentsScreen
 *   💰 Relatório — AdminFinancialScreen
 *
 * Design:
 * - Header customizado no topo com título "Painel Admin"
 * - Top Tabs rosa com indicador animado
 * - Transição suave entre abas com swipe
 *
 * Estrutura:
 * AdminTabs
 *   ├── Agendamentos (AdminAppointmentsScreen)
 *   └── Relatório (AdminFinancialScreen)
 * ============================================================
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors } from '../theme/colors';
import AdminAppointmentsScreen from '../screens/AdminAppointmentsScreen';
import AdminFinancialScreen from '../screens/AdminFinancialScreen';

const TopTab = createMaterialTopTabNavigator();

export default function AdminTabs() {
  return (
    <View style={styles.container}>
      {/* ──── Header do Admin ──── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔑 Painel Admin</Text>
        <Text style={styles.headerSubtitle}>Gerencie agendamentos e finanças</Text>
      </View>

      {/* ──── Top Tabs ──── */}
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarPressColor: Colors.accent,
        }}
      >
        <TopTab.Screen
          name="AdminAppointments"
          component={AdminAppointmentsScreen}
          options={{ tabBarLabel: '📋 Agendamentos' }}
        />
        <TopTab.Screen
          name="AdminFinancial"
          component={AdminFinancialScreen}
          options={{ tabBarLabel: '💰 Relatório' }}
        />
      </TopTab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  tabBar: {
    backgroundColor: Colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'none',
  },
  tabIndicator: {
    backgroundColor: Colors.primary,
    height: 3,
    borderRadius: 2,
  },
});
