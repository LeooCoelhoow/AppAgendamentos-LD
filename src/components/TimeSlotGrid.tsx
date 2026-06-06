/**
 * ============================================================
 * components/TimeSlotGrid.tsx — Grade de Horários Disponíveis
 * ============================================================
 *
 * Componente que exibe horários disponíveis em uma grade de
 * 3 colunas. Usado na tela de agendamento para que o usuário
 * selecione em qual horário deseja marcar o serviço.
 *
 * Design:
 * - Grid de 3 colunas usando FlatList
 * - Horário disponível: fundo accent (rosa pastel)
 * - Horário selecionado: fundo primary (rosa) com texto branco
 * - Horário indisponível: fundo cinza com texto claro (desabilitado)
 *
 * Props:
 * - selectedTime: string — horário selecionado (ex: "14:00")
 * - onSelectTime: (time: string) => void — callback de seleção
 * ============================================================
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { TimeSlot } from '../types';
import { getMyAppointmentsAPI } from '../services/api';

/** Tipagem das props do TimeSlotGrid */
interface TimeSlotGridProps {
  /** Horário atualmente selecionado */
  selectedTime: string;
  /** Data atualmente selecionada */
  selectedDate: Date | null;
  /** Função chamada ao selecionar um horário */
  onSelectTime: (time: string) => void;
}

/**
 * Gera os horários disponíveis do dia
 *
 * Cria slots de 1 em 1 hora das 9h às 18h.
 * Alguns horários são marcados como indisponíveis (mock)
 * para simular uma agenda já parcialmente preenchida.
 *
 * @returns Array de TimeSlot com horário e disponibilidade
 */
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Horários que estão "ocupados" (simulação mock)
  const unavailable = ['09:00'] ;

  for (let hour = 9; hour <= 18; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`;
    slots.push({
      time,
      available: !unavailable.includes(time),  // Marca como indisponível se estiver na lista
    });
  }

  return slots;
}

export default function TimeSlotGrid({ selectedTime, onSelectTime }: TimeSlotGridProps) {
  /** Gera os slots de horário */
  const timeSlots = generateTimeSlots();

  /**
   * Renderiza cada item da grade (um slot de horário)
   *
   * Determina o estilo baseado em:
   * 1. Se está selecionado → fundo rosa com texto branco
   * 2. Se está disponível → fundo accent (rosa pastel)
   * 3. Se está indisponível → fundo cinza, desabilitado
   */
  const renderSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = item.time === selectedTime;
    const isAvailable = item.available;

    return (
      <TouchableOpacity
        style={[
          styles.slot,
          // Aplica estilo condicional baseado no estado do slot
          isSelected && styles.slotSelected,
          !isAvailable && styles.slotUnavailable,
        ]}
        onPress={() => {
          // Só permite selecionar se o horário estiver disponível
          if (isAvailable) {
            onSelectTime(item.time);
          }
        }}
        activeOpacity={isAvailable ? 0.7 : 1}   // Sem feedback se indisponível
        disabled={!isAvailable}                   // Desabilita interação se ocupado
      >
        <Text
          style={[
            styles.slotText,
            isSelected && styles.slotTextSelected,
            !isAvailable && styles.slotTextUnavailable,
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
    marginBottom: 20,                            // Espaço abaixo do componente
    paddingHorizontal: 20,                       // Padding lateral
  },
  label: {
    fontSize: 16,                                // Tamanho do label
    fontWeight: '600',                           // Semi-bold
    color: Colors.textPrimary,                   // Texto escuro
    marginBottom: 12,                            // Espaço entre label e grade
  },
  row: {
    justifyContent: 'space-between',             // Distribui as 3 colunas igualmente
    marginBottom: 10,                            // Espaço entre linhas da grade
  },
  slot: {
    flex: 1,                                     // Ocupa 1/3 do espaço
    marginHorizontal: 4,                         // Pequeno espaço entre slots
    paddingVertical: 14,                         // Altura interna do slot
    borderRadius: 12,                            // Bordas arredondadas
    backgroundColor: Colors.accent,              // Fundo rosa pastel (disponível)
    alignItems: 'center',                        // Centraliza o texto
    justifyContent: 'center',
  },
  slotSelected: {
    backgroundColor: Colors.primary,             // Fundo rosa principal (selecionado)
    // Sombra rosa no item selecionado
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  slotUnavailable: {
    backgroundColor: '#F0F0F0',                  // Cinza claro (indisponível)
  },
  slotText: {
    fontSize: 15,                                // Tamanho do texto do horário
    fontWeight: '600',                           // Semi-bold
    color: Colors.primaryDark,                   // Rosa escuro (disponível)
  },
  slotTextSelected: {
    color: Colors.textOnPrimary,                 // Branco (selecionado)
    fontWeight: '700',                           // Bold para destaque
  },
  slotTextUnavailable: {
    color: '#BDBDBD',                            // Cinza (indisponível)
  },
});
