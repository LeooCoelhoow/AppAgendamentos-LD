/**
 * ============================================================
 * screens/ProfileScreen.tsx — Tela de Perfil do Usuário
 * ============================================================
 *
 * Tela que exibe as informações reais do perfil do usuário
 * autenticado via AuthContext. Os dados vêm do JWT/API.
 *
 * Seções:
 * 1. Avatar com nome e e-mail (dados reais do AuthContext)
 * 2. Estatísticas rápidas (total de agendamentos)
 * 3. Menu de opções (Editar Perfil, Notificações, Sobre, Sair)
 *
 * O botão "Sair" chama a função logout do AuthContext,
 * que remove o token e redireciona para a tela de Login.
 * ============================================================
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { useAppointments } from '../context/AppointmentsContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

/**
 * Interface para os itens do menu de opções
 */
interface MenuItem {
  /** Identificador único do item */
  id: string;
  /** Emoji como ícone do item */
  icon: string;
  /** Texto do item */
  label: string;
  /** Descrição auxiliar */
  subtitle: string;
}

/**
 * Lista de opções do menu do perfil
 *
 * Cada item tem um ícone (emoji), label e subtitle.
 * A ação de cada item pode ser implementada futuramente.
 */
const menuItems: MenuItem[] = [
  {
    id: 'edit',
    icon: '✏️',
    label: 'Editar Perfil',
    subtitle: 'Altere suas informações pessoais',
  },
  {
    id: 'notifications',
    icon: '🔔',
    label: 'Notificações',
    subtitle: 'Gerencie seus alertas e lembretes',
  },
  {
    id: 'about',
    icon: '💡',
    label: 'Sobre o App',
    subtitle: 'Versão, termos e políticas',
  },
  {
    id: 'logout',
    icon: '🚪',
    label: 'Sair',
    subtitle: 'Encerrar sua sessão',
  },
];

export default function ProfileScreen() {
  /** Lê os agendamentos para exibir estatísticas */
  const { appointments } = useAppointments();
  /** Dados do usuário autenticado e função de logout */
  const { user, logout } = useAuth();

  /**
   * Handler do botão "Sair"
   * Exibe confirmação antes de fazer logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ──────────── HEADER ──────────── */}
      <Header
        title="Meu Perfil"
        subtitle="Suas informações e configurações"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ──── Avatar e Informações do Usuário ──── */}
        <View style={styles.profileCard}>
          {/* Avatar circular com inicial do nome do usuário */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>

          {/* Nome do usuário (dados reais do AuthContext) */}
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>

          {/* E-mail do usuário (dados reais) */}
          <Text style={styles.userEmail}>{user?.email || ''}</Text>

          {/* ──── Estatísticas Rápidas ──── */}
          <View style={styles.statsRow}>
            {/* Total de agendamentos */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Agendamentos</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.statDivider} />

            {/* Agendamentos confirmados */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {appointments.filter((a) => a.status === 'confirmado').length}
              </Text>
              <Text style={styles.statLabel}>Confirmados</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.statDivider} />

            {/* Agendamentos concluídos */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {appointments.filter((a) => a.status === 'concluido').length}
              </Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>
          </View>
        </View>

        {/* ──── Menu de Opções ──── */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                // Não coloca borda no último item
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              activeOpacity={0.6}
              onPress={() => {
                // Ação do botão "Sair" — chama o logout
                if (item.id === 'logout') {
                  handleLogout();
                }
                // TODO: Implementar ações dos outros itens do menu
              }}
            >
              {/* Ícone do item (emoji) */}
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>

              {/* Textos do item */}
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              {/* Seta indicando que é clicável */}
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ──── Rodapé ──── */}
        <Text style={styles.versionText}>App Agendamentos v1.0.0</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

/**
 * Estilos da ProfileScreen
 *
 * Card de perfil centralizado com avatar, nome e estatísticas.
 * Menu de opções com ícones, labels e setas em card separado.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  // ──── Card do Perfil ────
  profileCard: {
    backgroundColor: Colors.surface,              // Fundo branco
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',                         // Centraliza o conteúdo
    // Sombra
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: {
    width: 80,                                    // Tamanho do avatar
    height: 80,
    borderRadius: 40,                             // Circular
    backgroundColor: Colors.accent,               // Fundo rosa pastel
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    // Borda rosa sutil
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarText: {
    fontSize: 36,                                 // Inicial do nome ou emoji
    color: Colors.primary,                        // Rosa principal
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,                                 // Nome grande
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  // ──── Estatísticas ────
  statsRow: {
    flexDirection: 'row',                         // Estatísticas em linha
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',               // Distribui igualmente
    backgroundColor: Colors.accentLight,          // Fundo rosa muito suave
    borderRadius: 14,
    paddingVertical: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,                                 // Número grande
    fontWeight: '700',
    color: Colors.primary,                        // Rosa principal
  },
  statLabel: {
    fontSize: 11,                                 // Label pequeno
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,                                     // Linha vertical fina
    height: 30,
    backgroundColor: Colors.border,               // Rosa sutil
  },
  // ──── Menu de Opções ────
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 6,
    // Sombra
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',                         // Layout horizontal
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,                         // Linha entre itens
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,                                    // Container do emoji
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextContainer: {
    flex: 1,                                      // Ocupa o espaço restante
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,                                 // Seta grande
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  // ──── Rodapé ────
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 24,
    marginBottom: 10,
  },
  bottomSpacer: {
    height: 30,
  },
});
