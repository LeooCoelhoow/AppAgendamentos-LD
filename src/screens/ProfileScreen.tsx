/**
 * ============================================================
 * screens/ProfileScreen.tsx — Tela de Perfil do Usuário
 * ============================================================
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // 👈 IMPORTADO
import { Colors } from '../theme/colors';
import { useAppointments } from '../context/AppointmentsContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { getAllAppointmentsAPI } from '../services/api'; // 👈 IMPORTADO
import { ApiAppointment } from '../types'; // 👈 IMPORTADO

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  subtitle: string;
}

const menuItems: MenuItem[] = [
  { id: 'edit', icon: '✏️', label: 'Editar Perfil', subtitle: 'Altere suas informações pessoais' },
  { id: 'notifications', icon: '🔔', label: 'Notificações', subtitle: 'Gerencie seus alertas e lembretes' },
  { id: 'about', icon: '💡', label: 'Sobre o App', subtitle: 'Versão, termos e políticas' },
  { id: 'logout', icon: '🚪', label: 'Sair', subtitle: 'Encerrar sua sessão' },
];

export default function ProfileScreen() {
  const { appointments } = useAppointments(); // Lista do cliente
  const { user, logout, token } = useAuth(); // 👈 Pegamos o token aqui também

  // Estado local para guardar os agendamentos do Admin
  const [adminAppointments, setAdminAppointments] = useState<ApiAppointment[]>([]);

  const ADMIN = user?.role === 'ADMIN';

  // =========================================================================
  // 🔄 ATUALIZAÇÃO EM TEMPO REAL PARA O ADMIN
  // =========================================================================
  useFocusEffect(
    useCallback(() => {
      async function fetchAdminStats() {
        if (ADMIN && token) {
          try {
            const response = await getAllAppointmentsAPI(token);
            setAdminAppointments(response.appointments);
          } catch (error) {
            console.error('Erro ao atualizar estatísticas do perfil:', error);
          }
        }
      }
      fetchAdminStats();
    }, [ADMIN, token])
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Tem certeza que deseja sair?');
      if (confirm) logout();
    } else {
      Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => await logout() },
      ]);
    }
  };

  // =========================================================================
  // 📊 LÓGICA DE ESTATÍSTICAS
  // =========================================================================
  
  // Se for Admin, usa a lista da API. Se for Cliente, usa a do Contexto.
  const dataSource = ADMIN ? adminAppointments : appointments;

  const activeAppointments = dataSource.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );
  const activeCount = activeAppointments.length;

  const completedAppointments = dataSource.filter((a) => a.status === 'COMPLETED');
  const completedCount = completedAppointments.length;

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" subtitle="Suas informações e configurações" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>

          {/* ──── Estatísticas Rápidas (EXCLUSIVO PARA ADMIN) ──── */}
          {ADMIN && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeCount}</Text>
                <Text style={styles.statLabel}>Ativos</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedCount}</Text>
                <Text style={styles.statLabel}>Concluídos</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              activeOpacity={0.6}
              onPress={() => {
                if (item.id === 'logout') handleLogout();
              }}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>App Agendamentos v1.0.0</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 24 },
  profileCard: {
    backgroundColor: Colors.surface,              
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',                         
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: {
    width: 80,                                    
    height: 80,
    borderRadius: 40,                             
    backgroundColor: Colors.accent,               
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarText: {
    fontSize: 36,                                 
    color: Colors.primary,                        
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,                                 
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',                         
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',               
    backgroundColor: Colors.accentLight,          
    borderRadius: 14,
    paddingVertical: 14,
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 22,                                 
    fontWeight: '700',
    color: Colors.primary,                        
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',                         
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIconContainer: {
    width: 40,                                    
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: { fontSize: 18 },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  menuArrow: { fontSize: 24, color: Colors.textSecondary, fontWeight: '300' },
  versionText: { textAlign: 'center', fontSize: 12, color: Colors.textSecondary, marginTop: 24, marginBottom: 10 },
  bottomSpacer: { height: 30 },
});