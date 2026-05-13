/**
 * ============================================================
 * screens/AdminFinancialScreen.tsx — Painel Admin: Relatório Financeiro
 * ============================================================
 *
 * Tela do relatório financeiro do administrador.
 *
 * Funcionalidades:
 * - Cards resumo: Receita, Despesas, Lucro Líquido
 * - Filtros por período: Este Mês, Último Mês, Todo Período
 * - Formulário para adicionar despesas (nome + valor)
 * - Lista de despesas com opção de remover
 * - Lista de receitas (serviços concluídos e confirmados)
 *
 * A receita só conta agendamentos com AMBAS confirmações
 * (clientConfirmed + adminConfirmed = true, status = COMPLETED).
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { FinancialReport } from '../types';
import {
  getFinancialReportAPI,
  createExpenseAPI,
  deleteExpenseAPI,
} from '../services/api';

type PeriodFilter = 'thisMonth' | 'lastMonth' | 'all';

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
 * Formata valor para moeda brasileira
 */
function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function AdminFinancialScreen() {
  const { token } = useAuth();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('all');

  // Estado do formulário de despesas
  const [expenseName, setExpenseName] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Busca o relatório financeiro da API
   */
  const fetchReport = useCallback(async () => {
    try {
      if (!token) return;
      const data = await getFinancialReportAPI(token, period);
      setReport(data);
    } catch (error: any) {
      console.error('❌ Erro ao buscar relatório:', error);
      Alert.alert('Erro', 'Não foi possível carregar o relatório.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token, period]);

  useEffect(() => {
    setIsLoading(true);
    fetchReport();
  }, [fetchReport]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReport();
  }, [fetchReport]);

  /**
   * Adiciona uma nova despesa
   */
  const handleAddExpense = async () => {
    if (!expenseName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da despesa.');
      return;
    }

    const value = parseFloat(expenseValue.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (!token) return;
      await createExpenseAPI(token, { name: expenseName.trim(), value });
      setExpenseName('');
      setExpenseValue('');
      await fetchReport();
      Alert.alert('Sucesso ✅', 'Despesa adicionada!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao adicionar despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Remove uma despesa
   */
  const handleDeleteExpense = (id: string, name: string) => {
    Alert.alert(
      'Remover Despesa',
      `Deseja remover "${name}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);
              if (!token) return;
              await deleteExpenseAPI(token, id);
              await fetchReport();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao remover despesa.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando relatório...</Text>
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
      {/* ──── Filtros de Período ──── */}
      <View style={styles.filtersRow}>
        {([
          { key: 'thisMonth' as PeriodFilter, label: 'Este Mês' },
          { key: 'lastMonth' as PeriodFilter, label: 'Último Mês' },
          { key: 'all' as PeriodFilter, label: 'Tudo' },
        ]).map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              period === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setPeriod(filter.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              period === filter.key && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ──── Cards Resumo ──── */}
      <View style={styles.summaryRow}>
        {/* Receita */}
        <View style={[styles.summaryCard, styles.revenueCard]}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Receita</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {formatCurrency(report?.totalRevenue || 0)}
          </Text>
        </View>

        {/* Despesas */}
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryIcon}>📉</Text>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {formatCurrency(report?.totalExpenses || 0)}
          </Text>
        </View>
      </View>

      {/* Lucro Líquido — card grande */}
      <View style={[
        styles.profitCard,
        (report?.netProfit || 0) >= 0
          ? styles.profitPositive
          : styles.profitNegative,
      ]}>
        <Text style={styles.profitIcon}>
          {(report?.netProfit || 0) >= 0 ? '💰' : '⚠️'}
        </Text>
        <View>
          <Text style={styles.profitLabel}>Lucro Líquido</Text>
          <Text style={[
            styles.profitValue,
            (report?.netProfit || 0) >= 0
              ? { color: '#1B5E20' }
              : { color: Colors.danger },
          ]}>
            {formatCurrency(report?.netProfit || 0)}
          </Text>
        </View>
      </View>

      {/* ──── Seção: Adicionar Despesa ──── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💸 Adicionar Despesa</Text>
      </View>

      <View style={styles.expenseForm}>
        <TextInput
          style={styles.input}
          placeholder="Nome da despesa (ex: Aluguel)"
          placeholderTextColor={Colors.textSecondary}
          value={expenseName}
          onChangeText={setExpenseName}
        />
        <View style={styles.valueRow}>
          <TextInput
            style={[styles.input, styles.valueInput]}
            placeholder="Valor (R$)"
            placeholderTextColor={Colors.textSecondary}
            value={expenseValue}
            onChangeText={setExpenseValue}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              isSubmitting && styles.addButtonDisabled,
            ]}
            onPress={handleAddExpense}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.addButtonText}>+ Adicionar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ──── Seção: Lista de Despesas ──── */}
      {(report?.expenseItems?.length || 0) > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Despesas</Text>
            <View style={[styles.badge, { backgroundColor: Colors.dangerLight }]}>
              <Text style={[styles.badgeText, { color: Colors.danger }]}>
                {report?.expenseItems.length}
              </Text>
            </View>
          </View>

          {report?.expenseItems.map((expense) => (
            <View key={expense.id} style={styles.listItem}>
              <View style={[styles.listDot, { backgroundColor: Colors.danger }]} />
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{expense.name}</Text>
                <Text style={styles.listItemDate}>{formatDate(expense.date)}</Text>
              </View>
              <Text style={[styles.listItemValue, { color: Colors.danger }]}>
                - {formatCurrency(expense.value)}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteExpense(expense.id, expense.name)}
                disabled={deletingId === expense.id}
              >
                {deletingId === expense.id ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : (
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* ──── Seção: Lista de Receitas ──── */}
      {(report?.revenueItems?.length || 0) > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ Receitas Confirmadas</Text>
            <View style={[styles.badge, { backgroundColor: Colors.successLight }]}>
              <Text style={[styles.badgeText, { color: Colors.success }]}>
                {report?.revenueItems.length}
              </Text>
            </View>
          </View>

          {report?.revenueItems.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={[styles.listDot, { backgroundColor: Colors.success }]} />
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{item.service}</Text>
                <Text style={styles.listItemDate}>
                  👤 {item.clientName} • {formatDate(item.date)}
                </Text>
              </View>
              <Text style={[styles.listItemValue, { color: Colors.success }]}>
                + {formatCurrency(item.price)}
              </Text>
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

  // ──── Filtros ────
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },

  // ──── Summary Cards ────
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  // ──── Profit Card ────
  profitCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profitPositive: {
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  profitNegative: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  profitIcon: {
    fontSize: 36,
  },
  profitLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  profitValue: {
    fontSize: 26,
    fontWeight: '800',
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
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ──── Expense Form ────
  expenseForm: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  input: {
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 10,
  },
  valueInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ──── List Items ────
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listItemDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 18,
  },

  bottomSpacer: {
    height: 30,
  },
});
