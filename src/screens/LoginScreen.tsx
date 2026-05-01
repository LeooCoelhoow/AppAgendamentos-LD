/**
 * ============================================================
 * screens/LoginScreen.tsx — Tela de Login
 * ============================================================
 *
 * Tela de autenticação com design clean rosa.
 * Validação com Zod, animação de shake em erros,
 * e integração com AuthContext para JWT.
 * ============================================================
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import AuthInput from '../components/AuthInput';
import { loginSchema } from '../utils/validations';
import { useAuth } from '../context/AuthContext';

type AuthStackParamList = { Login: undefined; Register: undefined; };
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { login } = useAuth();

  /** Animação de shake no card quando há erro */
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  /** Valida com Zod e chama a API de login */
  const handleLogin = async () => {
    setErrors({});
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Erro no login', error.message || 'Não foi possível fazer login.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo decorativo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌸</Text>
          <Text style={styles.logoTitle}>App Agendamentos</Text>
          <Text style={styles.logoSubtitle}>Beleza na palma da sua mão</Text>
        </View>

        {/* Card do formulário com shake */}
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnimation }] }]}>
          <Text style={styles.cardTitle}>Entrar</Text>
          <Text style={styles.cardSubtitle}>Faça login para acessar seus agendamentos</Text>

          <AuthInput icon="📧" placeholder="Seu e-mail" value={email}
            onChangeText={setEmail} error={errors.email}
            keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

          <AuthInput icon="🔒" placeholder="Sua senha" value={password}
            onChangeText={setPassword} error={errors.password}
            secureTextEntry autoCapitalize="none" />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin} activeOpacity={0.7} disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textOnPrimary} size="small" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Link para cadastro */}
        <TouchableOpacity style={styles.linkContainer}
          onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 48, marginBottom: 8 },
  logoTitle: { fontSize: 26, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  logoSubtitle: { fontSize: 14, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  button: {
    backgroundColor: Colors.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.textOnPrimary, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  linkContainer: { alignItems: 'center', marginTop: 24, paddingVertical: 8 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkTextBold: { color: Colors.primary, fontWeight: '700' },
});
