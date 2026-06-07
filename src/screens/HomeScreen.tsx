/**
 * ============================================================
 * screens/HomeScreen.tsx — Tela Inicial do App
 * ============================================================
 *
 * Tela principal que o usuário vê ao abrir o app.
 * Exibe uma saudação, a lista de serviços disponíveis
 * e os próximos agendamentos (se houver).
 *
 * Estrutura:
 * 1. Header — saudação "Olá, Bem-vinda! 💕"
 * 2. Seção "Nossos Serviços" — grid de ServiceCards
 * 3. Seção "Próximos Agendamentos" — lista resumida
 *
 * Navegação:
 * - Ao clicar em um ServiceCard, navega para BookingScreen
 *   passando o serviço selecionado como parâmetro
 *
 * Usa o hook useAppointments() para ler os agendamentos
 * salvos no contexto global (agora via API).
 * ============================================================
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { HomeStackParamList } from '../types';
import { services } from '../servicos/services';
import { useAppointments } from '../context/AppointmentsContext';
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';

/** Tipo de navegação para esta tela (tipagem segura) */
type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

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
  if (lower.includes('combo soft glam')) return '🎀';
  if (lower.includes('combo duo lift') || lower.includes('extensao')) return '💎';
  return '💅';
}

export default function HomeScreen() {
  /** Hook de navegação para navegar para a tela de agendamento */
  const navigation = useNavigation<HomeNavigationProp>();

  /** Lê os agendamentos do contexto global */
  const { appointments } = useAppointments();

  /**
   * Filtra apenas os agendamentos futuros (pendentes ou confirmados)
   * para mostrar na seção "Próximos Agendamentos"
   */
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'PENDING' || apt.status === 'CONFIRMED'
  );

  return (
    <View style={styles.container}>
      {/* ──────────── HEADER ──────────── */}
      <Header
        title="Olá, Bem-vinda! 💕"
        subtitle="Agende seus serviços de beleza"
      />

      {/* ──────────── CONTEÚDO PRINCIPAL (SCROLLÁVEL) ──────────── */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}    // Esconde a barra de scroll
        contentContainerStyle={styles.scrollContent}
      >
        {/* ──── Seção: Nossos Serviços ──── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💅 Nossos Serviços</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha o serviço e agende seu horário
          </Text>
        </View>

        {/* Lista de ServiceCards — um para cada serviço */}
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() => {
              // Navega para a tela de agendamento passando o serviço
              navigation.navigate('Booking', { service });
            }}
          />
        ))}

        {/* ──── Seção: Próximos Agendamentos ──── */}
        {upcomingAppointments.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Próximos Agendamentos</Text>
            </View>

            {/* Lista de mini-cards de agendamentos */}
            {upcomingAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.miniCard}>
                <View style={styles.miniCardLeft}>
                  <View style={styles.miniEmojiContainer}>
                    <Text style={styles.miniEmoji}>
                      {getServiceEmoji(appointment.service.name)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.miniServiceName} numberOfLines={1}>
                      {appointment.service.name}
                    </Text>
                    <Text style={styles.miniDate}>
                      📅 {formatDate(appointment.date)} • 🕐 {appointment.time}
                    </Text>
                  </View>
                </View>
                <Text style={styles.miniPrice}>
                  R$ {appointment.price.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Espaço extra no final para o conteúdo não ficar colado no bottom tab */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

/**
 * Estilos da HomeScreen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,                                    // Ocupa toda a tela
    backgroundColor: Colors.background,         // Fundo rosado suave
  },
  scrollView: {
    flex: 1,                                    // ScrollView ocupa o restante
  },
  scrollContent: {
    paddingTop: 20,                             // Espaço acima do primeiro card
  },
  section: {
    paddingHorizontal: 20,                      // Padding lateral da seção
    marginBottom: 16,                           // Espaço abaixo do título da seção
    marginTop: 8,                               // Espaço acima
  },
  sectionTitle: {
    fontSize: 20,                               // Título de seção grande
    fontWeight: '700',                          // Bold
    color: Colors.textPrimary,                  // Texto escuro
  },
  sectionSubtitle: {
    fontSize: 14,                               // Subtítulo menor
    color: Colors.textSecondary,                // Cinza
    marginTop: 4,                               // Pequeno espaço acima
  },
  // ──── Mini Cards de Agendamentos ────
  miniCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  miniCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniEmoji: {
    fontSize: 16,
  },
  miniServiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  miniDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  miniPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 30,                                 // Espaço no final do scroll
  },
});
