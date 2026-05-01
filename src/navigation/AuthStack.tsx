/**
 * ============================================================
 * navigation/AuthStack.tsx — Stack Navigator de Autenticação
 * ============================================================
 *
 * Stack Navigator para o fluxo de autenticação:
 *   Login → Register (e vice-versa)
 *
 * Sem header nativo para manter o visual clean.
 * Usado quando o usuário NÃO está autenticado.
 *
 * Quando o usuário faz login/cadastro com sucesso,
 * o AuthContext atualiza o estado e o App.tsx troca
 * automaticamente para o BottomTabs.
 * ============================================================
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

/** Parâmetros das telas de autenticação */
export type AuthStackParamList = {
  /** Tela de Login — sem parâmetros */
  Login: undefined;
  /** Tela de Cadastro — sem parâmetros */
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,  // Sem header nativo (visual clean)
        animation: 'slide_from_right', // Animação de transição
      }}
    >
      {/* Tela de Login (tela inicial do fluxo de auth) */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Tela de Cadastro */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
