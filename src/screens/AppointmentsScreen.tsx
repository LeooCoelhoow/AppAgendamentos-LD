/**
 * ============================================================
 * screens/AppointmentsScreen.tsx — Tela Meus Agendamentos
 * ============================================================
 *
 * Tela que lista todos os agendamentos marcados pelo usuário.
 * Os agendamentos são separados em seções:
 *
 * 1. "Próximos" — agendamentos pendentes e confirmados
 * 2. "Concluídos" — agendamentos já realizados
 * 3. "Cancelados" — agendamentos cancelados
 *
 * Funcionalidades:
 * - Lista agendamentos da API (backend)
 * - Botão "Confirmar Presença" para a cliente confirmar
 * - Pull-to-refresh para atualizar lista
 * - Estado vazio amigável
 *
 * Lê os dados do contexto global (AppointmentsContext)
 * que agora busca da API REST.
 * ============================================================
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Platform
} from 'react-native';
import { GestureHandlerRootView, TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Colors } from '../theme/colors';
import { useAppointments } from '../context/AppointmentsContext';
import { ApiAppointment } from '../types';
import Header from '../components/Header';

/**
 * Formata data ISO para DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Retorna emoji do serviço baseado no nome
 */
function getServiceEmoji(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  if (lower.includes('brow') || lower.includes('lamination')) return '✨';
  if (lower.includes('design')) return '🖌️';
  if (lower.includes('lash') || lower.includes('lifting')) return '👁️';
  if (lower.includes('henna')) return '🎨';
  if (lower.includes('micro')) return '💎';
  return '💅';
}

/**
 * Status config para cores e labels
 */
const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  PENDING: {
    label: 'Pendente',
    bgColor: '#FFF3CD',
    textColor: '#856404',
  },
  CONFIRMED: {
    label: 'Confirmado',
    bgColor: '#D4EDDA',
    textColor: '#155724',
  },
  COMPLETED: {
    label: 'Concluído',
    bgColor: '#D1ECF1',
    textColor: '#0C5460',
  },
  CANCELLED: {
    label: 'Cancelado',
    bgColor: '#F8D7DA',
    textColor: '#721C24',
  },
};

export default function AppointmentsScreen() {
  const { appointments, isLoading, fetchAppointments, confirmAppointment, cancelAppointment } = useAppointments();

  /**
   * Pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /**
   * Cliente confirma presença
   */
  const handleConfirm = async (appointment: ApiAppointment) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Confirma sua presença para ${appointment.service}?`);
      if (confirmed) {
        try {
          await confirmAppointment(appointment.id);
          window.alert('Presença confirmada com sucesso!');
        } catch (error: any) {
          window.alert(error.message || 'Erro ao confirmar presença.');
        }
      }
      return;
    }

    Alert.alert(
      'Confirmar Presença',
      `Confirma sua presença para ${appointment.service}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar ✅',
          onPress: async () => {
            try {
              await confirmAppointment(appointment.id);
              Alert.alert('Sucesso! ✅', 'Presença confirmada com sucesso!');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao confirmar presença.');
            }
          },
        },
      ]
    );
  };

  /**
   * Cliente cancela agendamento
   */
  const handleCancel = async (appointment: ApiAppointment) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Tem certeza que deseja cancelar seu agendamento de ${appointment.service}?`);
      if (confirmed) {
        try {
          await cancelAppointment(appointment.id);
          window.alert('Seu agendamento foi cancelado.');
        } catch (error: any) {
          window.alert(error.message || 'Erro ao cancelar o agendamento.');
        }
      }
      return;
    }

    Alert.alert(
      'Cancelar Agendamento',
      `Tem certeza que deseja cancelar seu agendamento de ${appointment.service}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              Alert.alert('Cancelado', 'Seu agendamento foi cancelado.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao cancelar o agendamento.');
            }
          },
        },
      ]
    );
  };

  /**
   * Separa os agendamentos por categoria
   */
  const upcoming = appointments.filter(
    (apt) => apt.status === 'PENDING' || apt.status === 'CONFIRMED'
  );
  const completed = appointments.filter((apt) => apt.status === 'COMPLETED');
  const cancelled = appointments.filter((apt) => apt.status === 'CANCELLED');

  /**
   * Renderiza um card de agendamento
   */
  const renderAppointmentCard = (appointment: ApiAppointment, showConfirmButton: boolean = false, isUpcoming: boolean = false) => {
    const status = statusConfig[appointment.status] || statusConfig.PENDING;

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <GHTouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleCancel(appointment)}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>
            ✕ Cancelar
          </Animated.Text>
        </GHTouchableOpacity>
      );
    };

    const cardContent = (
      <View style={styles.card}>
        {/* Linha superior: Ícone + Nome + Badge */}
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getServiceEmoji(appointment.service)}</Text>
          </View>

          <Text style={styles.serviceName} numberOfLines={1}>
            {appointment.service}
          </Text>

          <View style={[styles.badge, { backgroundColor: status.bgColor }]}>
            <Text style={[styles.badgeText, { color: status.textColor }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Linha inferior: Data, Horário, Valor */}
        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>📅 Data</Text>
            <Text style={styles.infoValue}>{formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🕐 Horário</Text>
            <Text style={styles.infoValue}>{appointment.time}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>💰 Valor</Text>
            <Text style={styles.infoValue}>
              R$ {appointment.price.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Indicador de confirmação da cliente */}
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>
            {appointment.clientConfirmed ? '✅ Presença confirmada' : '⏳ Confirme sua presença'}
          </Text>
        </View>

        {/* Botões de Ação */}
        {(showConfirmButton || isUpcoming) && (
          <View style={styles.actionButtonsContainer}>
            {showConfirmButton && !appointment.clientConfirmed && (
              <GHTouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleConfirm(appointment)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Confirmar Presença ✅</Text>
              </GHTouchableOpacity>
            )}

            {isUpcoming && Platform.OS === 'web' && (
              <GHTouchableOpacity
                style={styles.cancelButtonWeb}
                onPress={() => handleCancel(appointment)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonWebText}>Cancelar Agendamento ❌</Text>
              </GHTouchableOpacity>
            )}
          </View>
        )}
      </View>
    );

    if (isUpcoming && Platform.OS !== 'web') {
      return (
        <Swipeable
          key={appointment.id}
          renderRightActions={renderRightActions}
          overshootRight={false}
        >
          {cardContent}
        </Swipeable>
      );
    }

    return (
      <View key={appointment.id}>
        {cardContent}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* ──────────── HEADER ──────────── */}
      <Header
        title="Meus Agendamentos"
        subtitle="Acompanhe seus serviços marcados"
      />

      {/* ──────────── CONTEÚDO PRINCIPAL ──────────── */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ──── Estado Vazio ──── */}
        {!isLoading && appointments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não agendou nenhum serviço.{'\n'}
              Que tal agendar um agora? 💅
            </Text>
          </View>
        )}

        {/* ──── Loading ──── */}
        {isLoading && appointments.length === 0 && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyTitle, { marginTop: 12 }]}>Carregando...</Text>
          </View>
        )}

        {/* ──── Seção: Próximos Agendamentos ──── */}
        {upcoming.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📌 Próximos</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{upcoming.length}</Text>
              </View>
            </View>

            {upcoming.map((appointment) =>
              renderAppointmentCard(appointment, true, true)
            )}
          </>
        )}

        {/* ──── Seção: Concluídos ──── */}
        {completed.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Concluídos</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{completed.length}</Text>
              </View>
            </View>

            {completed.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )}
          </>
        )}

        {/* ──── Seção: Cancelados ──── */}
        {cancelled.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>❌ Cancelados</Text>
              <View style={[styles.countBadge, { backgroundColor: Colors.danger }]}>
                <Text style={styles.countText}>{cancelled.length}</Text>
              </View>
            </View>

            {cancelled.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  // ──── Estado vazio ────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // ──── Seções ────
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  // ──── Card ────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // ──── Confirmação ────
  confirmationRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    marginTop: 10,
  },
  cancelButtonWeb: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFBABA',
  },
  cancelButtonWebText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteAction: {
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 24,
    marginRight: 20,
    marginTop: 0,
  },
  deleteActionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomSpacer: {
    height: 30,
  },
});
