/**
 * ============================================================
 * screens/BookingScreen.tsx — Tela de Agendamento
 * ============================================================
 *
 * Tela onde o usuário completa o agendamento de um serviço.
 * Recebe o serviço selecionado via parâmetros de navegação.
 *
 * Fluxo:
 * 1. Exibe informações do serviço selecionado no topo
 * 2. Usuário seleciona uma DATA (DateSelector)
 * 3. Carrega horários disponíveis do backend dinamicamente
 * 4. Usuário seleciona um HORÁRIO (TimeSlotGrid)
 * 5. Confirma o agendamento (PinkButton)
 * 6. Agendamento é salvo no BACKEND via API e navega de volta
 *
 * Validação:
 * - Botão só fica habilitado se data E horário forem selecionados
 * - Horários são carregados dinamicamente do backend
 * - Trata erro 409 (slot não disponível) com mensagem amigável
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { HomeStackParamList } from '../types';
import { useAppointments } from '../context/AppointmentsContext';
import Header from '../components/Header';
import DateSelector from '../components/DateSelector';
import TimeSlotGrid from '../components/TimeSlotGrid';
import PinkButton from '../components/PinkButton';
import SuccessOverlay from '../components/SuccessOverlay';

/** Tipo da rota para acessar os parâmetros de navegação */
type BookingRouteProp = RouteProp<HomeStackParamList, 'Booking'>;

export default function BookingScreen() {
  /** Acessa os parâmetros da rota (serviço selecionado) */
  const route = useRoute<BookingRouteProp>();
  const { service } = route.params;

  /** Hook de navegação para voltar à tela anterior */
  const navigation = useNavigation();

  /** Hook para adicionar agendamento ao contexto global (agora via API) */
  const { addAppointment, fetchAvailableSlots, availableSlots, isSlotsLoading } =
    useAppointments();

  // ──────────────────────────────────────────────
  // Estado local da tela
  // ──────────────────────────────────────────────

  /** Data selecionada pelo usuário (formato "YYYY-MM-DD") */
  const [selectedDate, setSelectedDate] = useState<string>('');

  /** Horário selecionado pelo usuário (formato "HH:00") */
  const [selectedTime, setSelectedTime] = useState<string>('');

  /** Estado de loading ao salvar */
  const [isSaving, setIsSaving] = useState(false);

  /** Estado do overlay de sucesso */
  const [showSuccess, setShowSuccess] = useState(false);

  /** Dados formatados para o overlay */
  const [successData, setSuccessData] = useState({
    date: '',
    time: '',
    price: '',
  });

  /**
   * Verifica se o botão de confirmar deve estar habilitado
   * Só habilita se AMBOS data e horário foram selecionados
   */
  const isFormValid = selectedDate !== '' && selectedTime !== '' && !isSaving;

  /**
   * Efeito: quando a data é selecionada, busca os horários disponíveis
   */
  useEffect(() => {
    if (selectedDate && service.id) {
      // Limpa a seleção de horário quando muda a data
      setSelectedTime('');
      // Busca os novos horários disponíveis
      fetchAvailableSlots(selectedDate, service.id);
    }
  }, [selectedDate, service.id, fetchAvailableSlots]);

  /**
   * handleConfirm — Processa a confirmação do agendamento
   *
   * 1. Envia o agendamento para o backend via API
   * 2. Exibe overlay animado de sucesso
   * 3. Após a animação, navega de volta para a tela Home
   */
  const handleConfirm = async () => {
    try {
      setIsSaving(true);

      // Cria o agendamento no backend
      await addAppointment({
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
      });

      // Formata a data para exibição (DD/MM/YYYY)
      const [year, month, day] = selectedDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      // Salva os dados formatados e mostra o overlay
      setSuccessData({
        date: formattedDate,
        time: selectedTime,
        price: service.price.toFixed(2).replace('.', ','),
      });
      setShowSuccess(true);
    } catch (error: any) {
      // Trata erro 409: horário não está mais disponível
      if (error.status === 409 || error.message?.includes('not available')) {
        Alert.alert(
          'Horário Indisponível',
          'Este horário não está mais disponível. Escolha outro horário e tente novamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Recarrega os slots disponíveis
                if (selectedDate && service.id) {
                  fetchAvailableSlots(selectedDate, service.id);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Erro ao agendar',
          error.message || 'Ocorreu um erro ao salvar o agendamento. Tente novamente.',
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * handleSuccessDismiss — Quando o overlay fecha, navega para Home
   */
  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* ──────────── HEADER ──────────── */}
      <Header
        title="Agendar Serviço"
        subtitle="Escolha a data e o horário"
      />

      {/* ──────────── CONTEÚDO PRINCIPAL ──────────── */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ──── Info do Serviço Selecionado ──── */}
        <View style={styles.serviceInfo}>
          {/* Emoji grande do serviço */}
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>{service.icon}</Text>
          </View>

          {/* Nome e detalhes do serviço */}
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc} numberOfLines={2}>
              {service.description}
            </Text>
            {/* Preço e duração */}
            <View style={styles.serviceMeta}>
              <Text style={styles.servicePrice}>
                R$ {service.price.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.serviceDuration}>
                ⏱ {service.duration} min
              </Text>
            </View>
          </View>
        </View>

        {/* ──── Seletor de Data ──── */}
        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}       // Atualiza o estado ao selecionar
        />

        {/* ──── Grade de Horários ──── */}
        <TimeSlotGrid
          availableSlots={availableSlots}
          selectedTime={selectedTime}
          isLoading={isSlotsLoading}
          onSelectTime={setSelectedTime}
        />

        {/* ──── Botão de Confirmar ──── */}
        {isSaving ? (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.savingText}>Salvando agendamento...</Text>
          </View>
        ) : (
          <PinkButton
            title="Confirmar Agendamento ✨"
            onPress={handleConfirm}
            disabled={!isFormValid}               // Desabilitado se algum campo estiver vazio
          />
        )}

        {/* Espaço no final */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ──────────── OVERLAY DE SUCESSO ──────────── */}
      <SuccessOverlay
        visible={showSuccess}
        serviceName={service.name}
        date={successData.date}
        time={successData.time}
        price={successData.price}
        onDismiss={handleSuccessDismiss}
      />
    </View>
  );
}

/**
 * Estilos da BookingScreen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,         // Fundo rosado suave
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  // ──── Card de informações do serviço ────
  serviceInfo: {
    flexDirection: 'row',                        // Layout horizontal
    alignItems: 'center',
    backgroundColor: Colors.surface,             // Fundo branco
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    // Sombra
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 60,                                   // Container do emoji maior
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.accent,              // Fundo rosa pastel
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceIcon: {
    fontSize: 28,                                // Emoji grande
  },
  serviceDetails: {
    flex: 1,                                     // Ocupa o espaço restante
  },
  serviceName: {
    fontSize: 18,                                // Nome do serviço
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',                        // Preço e duração lado a lado
    alignItems: 'center',
    gap: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,                       // Rosa — destaque
  },
  serviceDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  savingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  savingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
