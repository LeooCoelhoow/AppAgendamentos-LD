/**
 * ============================================================
 * colors.ts — Paleta de Cores do App de Agendamentos
 * ============================================================
 *
 * Este arquivo centraliza TODOS os tokens de cor utilizados
 * no aplicativo. Ao invés de espalhar cores hardcoded pelos
 * componentes, importamos este objeto e usamos os tokens.
 *
 * Paleta principal: tons de ROSA (pink) para transmitir
 * elegância e feminilidade, alinhado com o universo de
 * serviços de beleza.
 *
 * Uso:
 *   import { Colors } from '../theme/colors';
 *   backgroundColor: Colors.primary
 * ============================================================
 */

export const Colors = {
  // ──────────────────────────────────────────────
  // Cores Principais (Brand)
  // ──────────────────────────────────────────────

  /** Rosa principal — usado em botões, destaques e elementos interativos */
  primary: '#D4587A',

  /** Rosa claro — usado em fundos leves, ícones selecionados e hover states */
  primaryLight: '#F2A6B8',

  /** Rosa escuro — usado em textos sobre fundo claro e ações ativas/pressed */
  primaryDark: '#A83D5A',

  // ──────────────────────────────────────────────
  // Cores de Acentuação
  // ──────────────────────────────────────────────

  //** Rosa do background da tela de login */
  rosaLogin: '#FFD6E0',

  /** Rosa pastel — usado em cards, chips e badges */
  accent: '#FFD6E0',

  /** Rosa muito suave — fundo de destaque sutil */
  accentLight: '#FFF0F3',

  // ──────────────────────────────────────────────
  // Cores de Superfície
  // ──────────────────────────────────────────────

  /** Fundo geral do app — quase branco com leve tom rosado */
  background: '#FFF5F7',

  /** Fundo de cards, modais e superfícies elevadas */
  surface: '#FFFFFF',

  // ──────────────────────────────────────────────
  // Cores de Texto
  // ──────────────────────────────────────────────

  /** Texto principal — cinza escuro, alta legibilidade */
  textPrimary: '#2D2D2D',

  /** Texto secundário — cinza médio, informações auxiliares */
  textSecondary: '#7A7A7A',

  /** Texto sobre fundo colorido (primary) — branco puro */
  textOnPrimary: '#FFFFFF',

  // ──────────────────────────────────────────────
  // Cores Utilitárias
  // ──────────────────────────────────────────────

  /** Bordas e divisórias — rosa muito sutil */
  border: '#F0D4DC',

  /** Sucesso — verde suave para confirmações */
  success: '#4CAF50',

  /** Alerta — amarelo suave para avisos */
  warning: '#FFC107',

  /** Sombra — cor base para box shadows */
  shadow: '#D4587A',
};
