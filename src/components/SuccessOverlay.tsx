/**
 * ============================================================
 * components/SuccessOverlay.tsx — Overlay de Sucesso Animado
 * ============================================================
 *
 * Overlay fullscreen que aparece quando um agendamento é
 * confirmado com sucesso. Exibe uma animação bonita com:
 *
 * - Fundo com fade-in suave
 * - Card central com scale animation
 * - Checkmark animado com pulse
 * - Partículas decorativas flutuando
 * - Detalhes do agendamento confirmado
 * - Auto-dismiss após alguns segundos
 *
 * Props:
 *   visible: boolean — controla a visibilidade
 *   serviceName: string — nome do serviço
 *   date: string — data formatada (DD/MM/YYYY)
 *   time: string — horário
 *   price: string — valor formatado
 *   onDismiss: () => void — callback quando o overlay fecha
 * ============================================================
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SuccessOverlayProps {
  /** Se o overlay está visível */
  visible: boolean;
  /** Nome do serviço agendado */
  serviceName: string;
  /** Data formatada (DD/MM/YYYY) */
  date: string;
  /** Horário do agendamento */
  time: string;
  /** Preço formatado */
  price: string;
  /** Callback quando o overlay é fechado */
  onDismiss: () => void;
}

/**
 * Gera uma partícula decorativa animada
 */
function Particle({
  delay,
  startX,
  emoji,
}: {
  delay: number;
  startX: number;
  emoji: string;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT + 50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(1600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 120,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    ]);
    anim.start();

    return () => anim.stop();
  }, [delay, translateY, translateX, opacity, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() > 0.5 ? '' : '-'}${180 + Math.random() * 180}deg`],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          left: startX,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function SuccessOverlay({
  visible,
  serviceName,
  date,
  time,
  price,
  onDismiss,
}: SuccessOverlayProps) {
  // ──── Animações ────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const detailsTranslateY = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Reset all values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      checkScale.setValue(0);
      checkOpacity.setValue(0);
      detailsOpacity.setValue(0);
      detailsTranslateY.setValue(30);
      glowAnim.setValue(0.4);

      // Sequência de animações
      Animated.sequence([
        // 1. Fade in do fundo
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // 2. Scale do card principal
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        // 3. Checkmark aparece com bounce
        Animated.parallel([
          Animated.spring(checkScale, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(checkOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // 4. Detalhes deslizam para cima
        Animated.parallel([
          Animated.timing(detailsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(detailsTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Glow pulsante no checkmark
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-dismiss após 3 segundos
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible) return null;

  // Emojis para as partículas
  const particleEmojis = ['✨', '💅', '🌸', '💕', '⭐', '🎀', '💖', '🌺', '✿', '🦋'];
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    delay: Math.random() * 800,
    startX: Math.random() * (SCREEN_WIDTH - 40),
    emoji: particleEmojis[i % particleEmojis.length],
  }));

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* ──── Partículas decorativas ──── */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            delay={p.delay}
            startX={p.startX}
            emoji={p.emoji}
          />
        ))}

        {/* ──── Card Central ──── */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Checkmark animado */}
          <Animated.View
            style={[
              styles.checkContainer,
              {
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Animated.View style={[styles.checkGlow, { opacity: glowAnim }]} />
            <View style={styles.checkCircle}>
              <Text style={styles.checkEmoji}>✅</Text>
            </View>
          </Animated.View>

          {/* Título */}
          <Text style={styles.title}>Agendamento Confirmado!</Text>
          <Text style={styles.subtitle}>Tudo certo para o seu atendimento</Text>

          {/* Detalhes do agendamento */}
          <Animated.View
            style={[
              styles.detailsContainer,
              {
                opacity: detailsOpacity,
                transform: [{ translateY: detailsTranslateY }],
              },
            ]}
          >
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💅</Text>
              <Text style={styles.detailText}>{serviceName}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{date} às {time}</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💰</Text>
              <Text style={styles.detailTextPrice}>R$ {price}</Text>
            </View>
          </Animated.View>

          {/* Mensagem de retorno */}
          <Text style={styles.returnMessage}>Voltando para a tela inicial...</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(212, 88, 122, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    width: SCREEN_WIDTH * 0.85,
    alignItems: 'center',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.successLight,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.success,
  },
  checkEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  detailTextPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  returnMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
