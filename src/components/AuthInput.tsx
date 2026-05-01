/**
 * ============================================================
 * components/AuthInput.tsx — Input Reutilizável de Autenticação
 * ============================================================
 *
 * Componente de input estilizado para as telas de Login
 * e Cadastro. Características:
 *
 * - Ícone emoji à esquerda
 * - Placeholder com estilo customizado
 * - Bordas arredondadas (14px) com fundo branco
 * - Estado de erro: borda vermelha + mensagem abaixo
 * - Suporte a campo de senha com toggle de visibilidade
 *   (ícone de olho aberto/fechado)
 * - Animação de transição suave no estado de erro
 *
 * Props:
 *   - icon: Emoji do ícone à esquerda
 *   - placeholder: Texto do placeholder
 *   - value: Valor atual do input
 *   - onChangeText: Callback de mudança de texto
 *   - error: Mensagem de erro (exibe se definida)
 *   - secureTextEntry: Se é campo de senha
 *   - keyboardType: Tipo de teclado
 *   - autoCapitalize: Capitalização automática
 *
 * Uso:
 *   <AuthInput
 *     icon="📧"
 *     placeholder="Seu e-mail"
 *     value={email}
 *     onChangeText={setEmail}
 *     error={errors.email}
 *     keyboardType="email-address"
 *   />
 * ============================================================
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../theme/colors';

/**
 * Props do componente AuthInput
 *
 * Estende TextInputProps do React Native para herdar
 * todas as props nativas do TextInput.
 */
interface AuthInputProps extends TextInputProps {
  /** Emoji exibido à esquerda do input */
  icon: string;
  /** Mensagem de erro (exibida abaixo do input quando presente) */
  error?: string;
  /** Se o campo é de senha (habilita toggle de visibilidade) */
  secureTextEntry?: boolean;
}

export default function AuthInput({
  icon,
  error,
  secureTextEntry = false,
  ...rest
}: AuthInputProps) {
  /**
   * Estado que controla se a senha está visível
   * Apenas usado quando secureTextEntry é true
   */
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* ──── Container do Input ──── */}
      <View style={[styles.container, error ? styles.containerError : null]}>
        {/* Ícone emoji à esquerda */}
        <Text style={styles.icon}>{icon}</Text>

        {/* Input de texto */}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textSecondary}
          /* Se é campo de senha, controla visibilidade */
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />

        {/* Toggle de visibilidade da senha (olho) */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.6}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ──── Mensagem de Erro ──── */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/**
 * Estilos do AuthInput
 *
 * Container com fundo branco, bordas arredondadas (14px),
 * borda rosa sutil que fica vermelha no estado de erro.
 * Ícone e input lado a lado (flexDirection: row).
 */
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,          // Espaço entre inputs
  },
  container: {
    flexDirection: 'row',      // Ícone + Input lado a lado
    alignItems: 'center',
    backgroundColor: Colors.surface,   // Fundo branco
    borderRadius: 14,          // Bordas arredondadas
    borderWidth: 1.5,
    borderColor: Colors.border,        // Borda rosa sutil
    paddingHorizontal: 14,
    height: 54,                // Altura confortável para toque
    // Sombra sutil
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  containerError: {
    borderColor: '#E74C3C',    // Borda vermelha no erro
    borderWidth: 1.5,
  },
  icon: {
    fontSize: 18,              // Tamanho do emoji
    marginRight: 10,
  },
  input: {
    flex: 1,                   // Ocupa o espaço restante
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,        // Remove padding vertical padrão
  },
  eyeButton: {
    padding: 6,                // Área de toque do botão olho
    marginLeft: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#E74C3C',          // Vermelho para mensagens de erro
    fontSize: 12,
    marginTop: 5,
    marginLeft: 14,            // Alinhado com o texto do input
    fontWeight: '500',
  },
});
