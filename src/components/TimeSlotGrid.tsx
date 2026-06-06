/**
 * ============================================================
 * components/TimeSlotGrid.tsx — Grade de Horários Disponíveis
 * ============================================================
 *
 * Componente que exibe horários disponíveis em uma grade de
 * 3 colunas. Carrega dinamicamente os horários disponíveis
 * do backend considerando agendamentos já feitos.
 *
 * Design:
 * - Grid de 3 colunas usando FlatList
 * - Horário disponível: fundo accent (rosa pastel)
 * - Horário selecionado: fundo primary (rosa) com texto branco
 * - Horário indisponível: fundo cinza com texto claro (desabilitado)
 * - Loading state: mostra spinner/esqueleto enquanto carrega
 *
 * Props:
 * - availableSlots: string[] — horários disponíveis (ex: ["09:00", "10:00"])
 * - selectedTime: string — horário selecionado
 * - isLoading: boolean — estado de carregamento dos slots
 * - onSelectTime: (time: string) => void — callback de seleção
 * ============================================================
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { TimeSlot } from '../types';

/** Tipagem das props do TimeSlotGrid */
interface TimeSlotGridProps {
  /** Horários disponíveis do backend (ex: ["09:00", "09:30", "10:00"]) */
  availableSlots: string[];
  /** Horário atualmente selecionado */
  selectedTime: string;
  /** Se está carregando os slots do servidor */
  isLoading: boolean;
  /** Função chamada ao selecionar um horário */
  onSelectTime: (time: string) => void;
}

export default function TimeSlotGrid({
  availableSlots,
  selectedTime,
  isLoading,
  onSelectTime,
}: TimeSlotGridProps) {
  // Renderizar loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>🕐 Selecione o horário</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando horários disponíveis...</Text>
        </View>
      </View>
    );
  }

  // Renderizar mensagem se não há horários disponíveis
  if (availableSlots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>🕐 Selecione o horário</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum horário disponível para esta data. Por favor, escolha outra data.
          </Text>
        </View>
      </View>
    );
  }

  // Converter array de strings em TimeSlot objects
  const timeSlots: TimeSlot[] = availableSlots.map((time) => ({
    time,
    available: true, // Todos os slots aqui já são disponíveis
  }));

  /**
   * Renderiza cada item da grade (um slot de horário)
   *
   * Determina o estilo baseado em:
   * 1. Se está selecionado → fundo rosa com texto branco
   * 2. Se está disponível → fundo accent (rosa pastel)
   */
  const renderSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = item.time === selectedTime;

    return (
      <TouchableOpacity
        style={[
          styles.slot,
          isSelected && styles.slotSelected,
        ]}
        onPress={() => onSelectTime(item.time)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.slotText,
            isSelected && styles.slotTextSelected,
          ]}
        >
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label da seção */}
      <Text style={styles.label}>🕐 Selecione o horário</Text>

      {/* Grade de horários — 3 colunas */}
      <FlatList
        data={timeSlots}
        renderItem={renderSlot}
        keyExtractor={(item) => item.time}
        numColumns={3}                           // 3 colunas na grade
        columnWrapperStyle={styles.row}          // Estilo de cada linha
        scrollEnabled={false}                    // Desabilita scroll (já está dentro de ScrollView)
      />
    </View>
  );
}

/**
 * Estilos do TimeSlotGrid
 *
 * Cada slot é um botão com tamanho fixo dentro de uma grade
 * de 3 colunas. A FlatList distribui igualmente com gap.
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  slot: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  slotText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  slotTextSelected: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
});
