/**
 * ============================================================
 * screens/AdminAppointmentsScreen.tsx — Painel Admin: Agendamentos
 * ============================================================
 *
 * Tela do painel administrativo que exibe TODOS os agendamentos
 * do sistema, ordenados do mais recente para o mais antigo.
 *
 * Funcionalidades:
 * - Lista todos agendamentos com nome da cliente, serviço,
 *   data, horário e preço
 * - Badges visuais de status (confirmação cliente + admin)
 * - Botão "Finalizar Atendimento" — quando cliente confirmou
 * - Botão "Cancelar" — admin pode cancelar agendamentos
 * - Separação visual entre Pendentes/Confirmados e Finalizados
 * - Badge de notificação para novos agendamentos
 *
 * Regra de negócio:
 *   O atendimento só pode ser finalizado se a cliente
 *   já confirmou presença (clientConfirmed = true).
 *   Após admin confirmar, o lucro é contabilizado.
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiAppointment } from '../types';
import {
  getAllAppointmentsAPI,
  adminConfirmAppointmentAPI,
  cancelAppointmentAPI,
} from '../services/api';

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
  if (lower.includes('extensão') || lower.includes('extensao')) return '🌸';
  return '💅';
}

export default function AdminAppointmentsScreen() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /**
   * Busca todos os agendamentos da API
   */
  const fetchAppointments = useCallback(async () => {
    try {
      if (!token) return;
      const response = await getAllAppointmentsAPI(token);
      setAppointments(response.appointments);
    } catch (error: any) {
      console.error('❌ Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /**
   * Pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  /**
   * Admin finaliza o atendimento
   */
  const handleAdminConfirm = async (id: string) => {
    Alert.alert(
      'Finalizar Atendimento',
      'Confirma a finalização deste atendimento? O valor será contabilizado no relatório financeiro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setActionLoading(id);
              if (!token) return;
              await adminConfirmAppointmentAPI(token, id);
              await fetchAppointments();
              Alert.alert('Sucesso ✅', 'Atendimento finalizado com sucesso!');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao confirmar agendamento.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Admin cancela o agendamento
   */
  const handleCancel = async (id: string) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(id);
              if (!token) return;
              await cancelAppointmentAPI(token, id);
              await fetchAppointments();
              Alert.alert('Cancelado', 'Agendamento cancelado com sucesso.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao cancelar agendamento.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // ──── Separa agendamentos por status ────
  const active = appointments.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED');

  // ──── Contagem de novos (para badge) ────
  const newCount = appointments.filter(
    (a) => a.status === 'PENDING' && !a.adminConfirmed
  ).length;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* ──── Header da seção ──── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Agendamentos Ativos</Text>
        {newCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{newCount} novo{newCount > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* ──── Lista vazia ──── */}
      {active.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Nenhum agendamento ativo</Text>
        </View>
      )}

      {/* ──── Cards de Agendamentos Ativos ──── */}
      {active.map((appointment) => (
        <View key={appointment.id} style={styles.card}>
          {/* Linha 1: Emoji + Serviço + Status */}
          <View style={styles.cardHeader}>
            <View style={styles.serviceRow}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{getServiceEmoji(appointment.service)}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {appointment.service}
                </Text>
                <Text style={styles.clientName}>
                  👤 {appointment.user?.name || 'Cliente'}
                </Text>
              </View>
            </View>

            {/* Badge de status */}
            <View style={[
              styles.statusBadge,
              appointment.status === 'CONFIRMED'
                ? styles.statusConfirmed
                : styles.statusPending,
            ]}>
              <Text style={[
                styles.statusText,
                appointment.status === 'CONFIRMED'
                  ? styles.statusConfirmedText
                  : styles.statusPendingText,
              ]}>
                {appointment.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Linha 2: Data, Horário, Valor */}
          <View style={styles.infoRow}>
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
              <Text style={styles.infoValuePrice}>
                R$ {appointment.price.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          {/* Linha 3: Confirmações */}
          <View style={styles.confirmationsRow}>
            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>
                {appointment.clientConfirmed ? '✅' : '⏳'} Cliente
              </Text>
              <Text style={[
                styles.confirmationStatus,
                appointment.clientConfirmed
                  ? styles.confirmedText
                  : styles.pendingText,
              ]}>
                {appointment.clientConfirmed ? 'Confirmou' : 'Aguardando'}
              </Text>
            </View>
            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>
                {appointment.adminConfirmed ? '✅' : '⏳'} Admin
              </Text>
              <Text style={[
                styles.confirmationStatus,
                appointment.adminConfirmed
                  ? styles.confirmedText
                  : styles.pendingText,
              ]}>
                {appointment.adminConfirmed ? 'Finalizado' : 'Aguardando'}
              </Text>
            </View>
          </View>

          {/* Linha 4: Botões de ação */}
          <View style={styles.actionsRow}>
            {/* Botão Finalizar — só aparece se cliente confirmou e admin não */}
            {appointment.clientConfirmed && !appointment.adminConfirmed && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleAdminConfirm(appointment.id)}
                disabled={actionLoading === appointment.id}
                activeOpacity={0.8}
              >
                {actionLoading === appointment.id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>✅ Finalizar Atendimento</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Botão Cancelar */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(appointment.id)}
              disabled={actionLoading === appointment.id}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* ──── Seção: Finalizados ──── */}
      {completed.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ Finalizados</Text>
            <View style={[styles.newBadge, { backgroundColor: Colors.successLight }]}>
              <Text style={[styles.newBadgeText, { color: Colors.success }]}>
                {completed.length}
              </Text>
            </View>
          </View>

          {completed.map((appointment) => (
            <View key={appointment.id} style={[styles.card, styles.completedCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceRow}>
                  <View style={[styles.emojiContainer, { backgroundColor: Colors.successLight }]}>
                    <Text style={styles.emoji}>{getServiceEmoji(appointment.service)}</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {appointment.service}
                    </Text>
                    <Text style={styles.clientName}>
                      👤 {appointment.user?.name || 'Cliente'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, styles.statusCompleted]}>
                  <Text style={styles.statusCompletedText}>Concluído</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
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
                  <Text style={[styles.infoValuePrice, { color: Colors.success }]}>
                    R$ {appointment.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {/* ──── Seção: Cancelados ──── */}
      {cancelled.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❌ Cancelados</Text>
            <View style={[styles.newBadge, { backgroundColor: Colors.dangerLight }]}>
              <Text style={[styles.newBadgeText, { color: Colors.danger }]}>
                {cancelled.length}
              </Text>
            </View>
          </View>

          {cancelled.map((appointment) => (
            <View key={appointment.id} style={[styles.card, styles.cancelledCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceRow}>
                  <View style={[styles.emojiContainer, { backgroundColor: Colors.dangerLight }]}>
                    <Text style={styles.emoji}>{getServiceEmoji(appointment.service)}</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { opacity: 0.6 }]} numberOfLines={1}>
                      {appointment.service}
                    </Text>
                    <Text style={[styles.clientName, { opacity: 0.6 }]}>
                      👤 {appointment.user?.name || 'Cliente'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, styles.statusCancelled]}>
                  <Text style={styles.statusCancelledText}>Cancelado</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // ──── Section Headers ────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 10,
  },
  newBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ──── Empty State ────
  emptyCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ──── Cards ────
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  cancelledCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    opacity: 0.7,
  },

  // ──── Card Header ────
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  emojiContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  clientName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // ──── Status Badges ────
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusPendingText: {
    color: '#856404',
    fontSize: 11,
    fontWeight: '700',
  },
  statusConfirmed: {
    backgroundColor: '#D4EDDA',
  },
  statusConfirmedText: {
    color: '#155724',
    fontSize: 11,
    fontWeight: '700',
  },
  statusCompleted: {
    backgroundColor: '#D1ECF1',
  },
  statusCompletedText: {
    color: '#0C5460',
    fontSize: 11,
    fontWeight: '700',
  },
  statusCancelled: {
    backgroundColor: '#F8D7DA',
  },
  statusCancelledText: {
    color: '#721C24',
    fontSize: 11,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ──── Divider ────
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },

  // ──── Info Row ────
  infoRow: {
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
  infoValuePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ──── Confirmations ────
  confirmationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmationItem: {
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  confirmationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmedText: {
    color: Colors.success,
  },
  pendingText: {
    color: Colors.warning,
  },

  // ──── Action Buttons ────
  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 30,
  },
});
