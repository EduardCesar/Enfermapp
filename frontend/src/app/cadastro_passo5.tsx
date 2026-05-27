import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ─── PALETA PETRÓLEO + OLIVA ──────────────────────────────────────────────────
const PETROLEO      = '#1B4D4D';
const PETROLEO_VIVO = '#2A7A7A';
const PETROLEO_BG   = '#E0EBEB';
const OLIVA         = '#5C6B2E';
const OLIVA_VIVA    = '#7A8F3A';
const OLIVA_BG      = '#ECF0DC';
const CREAM         = '#F7F5F0';
const WHITE         = '#FFFFFF';
const TEXT_DARK     = '#1A1A1A';
const TEXT_MID      = '#6B6B6B';
const BORDER        = '#E0DDD6';
const GOLD          = '#C9A84C';
const GOLD_BG       = '#FBF5E6';
// ───────────────────────────────────────────────────────────────────────────────

type PlanoId = 'normal' | 'premium';

interface Plano {
  id: PlanoId;
  nome: string;
  tagline: string;
  preco: string;
  periodo: string;
  valor: string;
  beneficios: string[];
  destaque?: boolean;
}

const planos: Plano[] = [
  {
    id: 'normal',
    nome: 'Normal',
    tagline: 'Para começar com o pé direito',
    preco: 'R$ 49',
    periodo: '/mês',
    valor: '49.00',
    beneficios: [
      'Perfil profissional na plataforma',
      'Recebimento de solicitações',
      'Chat com pacientes',
      'Agendamento de atendimentos',
      'Avaliações no perfil',
    ],
  },
  {
    id: 'premium',
    nome: 'Premium',
    tagline: 'Visibilidade máxima na plataforma',
    preco: 'R$ 69',
    periodo: '/mês',
    valor: '69.00',
    destaque: true,
    beneficios: [
      'Tudo do plano Normal',
      'Destaque nas buscas do app',
      'Prioridade nas solicitações',
      'Badge de profissional premium',
      'Relatórios de desempenho',
    ],
  },
];

export default function CadastroPasso5() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoId | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleIrParaPagamento = () => {
    if (!planoSelecionado) {
      Alert.alert('Atenção', 'Selecione um plano para prosseguir.');
      return;
    }
    animateButton();
    const plano = planos.find(p => p.id === planoSelecionado)!;
    router.push({
      pathname: '/tela_pagamento',
      params: {
        ...params,
        planoId: planoSelecionado,
        valor: plano.valor,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar – 100% no passo 5 */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepNumber}>05</Text>
            <View style={styles.stepDivider}>
              <Text style={styles.stepDividerText}>/</Text>
              <Text style={styles.stepTotal}>5</Text>
            </View>
            <Text style={styles.stepLabel}>Plano</Text>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Escolha seu</Text>
            <Text style={styles.titleAccent}>plano profissional</Text>
          </View>

          {/* Cards de plano */}
          <View style={styles.planosContainer}>
            {planos.map((plano) => {
              const selecionado = planoSelecionado === plano.id;
              const isPremium   = plano.destaque;

              return (
                <TouchableOpacity
                  key={plano.id}
                  activeOpacity={0.92}
                  onPress={() => setPlanoSelecionado(plano.id)}
                  style={[
                    styles.planoCard,
                    isPremium && styles.planoCardPremium,
                    selecionado && styles.planoCardSelecionado,
                    isPremium && selecionado && styles.planoCardPremiumSelecionado,
                  ]}
                >
                  {/* Badge "Mais popular" */}
                  {isPremium && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>⭐ Mais popular</Text>
                    </View>
                  )}

                  {/* Cabeçalho do card */}
                  <View style={[
                    styles.cardHeader,
                    isPremium ? styles.cardHeaderPremium : styles.cardHeaderNormal,
                  ]}>
                    <View>
                      <Text style={[
                        styles.cardNome,
                        isPremium && styles.cardNomePremium,
                      ]}>
                        {plano.nome}
                      </Text>
                      <Text style={[
                        styles.cardTagline,
                        isPremium && styles.cardTaglinePremium,
                      ]}>
                        {plano.tagline}
                      </Text>
                    </View>
                    <View style={styles.precoContainer}>
                      <Text style={[
                        styles.preco,
                        isPremium && styles.precoPremium,
                      ]}>
                        {plano.preco}
                      </Text>
                      <Text style={[
                        styles.periodo,
                        isPremium && styles.periodoPremium,
                      ]}>
                        {plano.periodo}
                      </Text>
                    </View>
                  </View>

                  {/* Separador */}
                  <View style={[
                    styles.cardDivider,
                    isPremium && styles.cardDividerPremium,
                  ]} />

                  {/* Benefícios */}
                  <View style={styles.cardBody}>
                    {plano.beneficios.map((b, i) => (
                      <View key={i} style={styles.beneficioRow}>
                        <View style={[
                          styles.checkCircle,
                          isPremium && styles.checkCirclePremium,
                        ]}>
                          <Text style={[
                            styles.checkIcon,
                            isPremium && styles.checkIconPremium,
                          ]}>✓</Text>
                        </View>
                        <Text style={[
                          styles.beneficioText,
                          isPremium && styles.beneficioTextPremium,
                        ]}>
                          {b}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Rodapé do card – indicador de seleção */}
                  <View style={[
                    styles.cardFooter,
                    selecionado && (isPremium ? styles.cardFooterPremiumSelecionado : styles.cardFooterNormalSelecionado),
                  ]}>
                    <Text style={[
                      styles.cardFooterText,
                      selecionado && styles.cardFooterTextSelecionado,
                    ]}>
                      {selecionado ? '✓  Plano selecionado' : 'Selecionar este plano'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info sobre segurança */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              Pagamento seguro via gateway criptografado. Cancele a qualquer momento.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.nextButton,
                  !planoSelecionado && styles.nextButtonDisabled,
                ]}
                onPress={handleIrParaPagamento}
                disabled={!planoSelecionado}
              >
                <Text style={styles.nextButtonText}>
                  {planoSelecionado ? 'Ir para pagamento' : 'Selecione um plano'}
                </Text>
                {planoSelecionado && <Text style={styles.arrowRight}>→</Text>}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // ─── Progress bar ─────────────────────────────────────────────────────────
  progressBarContainer: {
    height: 4,
    backgroundColor: BORDER,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PETROLEO,
  },

  // ─── Layout ───────────────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 28,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: PETROLEO,
    letterSpacing: -2,
  },
  stepDivider: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 4,
  },
  stepDividerText: {
    fontSize: 24,
    color: TEXT_MID,
    fontWeight: '300',
  },
  stepTotal: {
    fontSize: 20,
    color: TEXT_MID,
    fontWeight: '400',
    marginLeft: 2,
  },
  stepLabel: {
    fontSize: 13,
    color: OLIVA,
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  // ─── Title ────────────────────────────────────────────────────────────────
  titleSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '300',
    color: PETROLEO_VIVO,
    letterSpacing: -0.5,
  },

  // ─── Cards ────────────────────────────────────────────────────────────────
  planosContainer: {
    gap: 16,
    marginBottom: 20,
  },

  planoCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  planoCardPremium: {
    backgroundColor: '#0E2E2E',
    borderColor: GOLD,
  },
  planoCardSelecionado: {
    borderColor: PETROLEO,
    borderWidth: 2,
    shadowColor: PETROLEO,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  planoCardPremiumSelecionado: {
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  // Badge
  badgeContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E2E2E',
    letterSpacing: 0.3,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  cardHeaderNormal: {},
  cardHeaderPremium: {},

  cardNome: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardNomePremium: {
    color: GOLD,
  },
  cardTagline: {
    fontSize: 12,
    color: TEXT_MID,
    fontWeight: '400',
    maxWidth: 160,
  },
  cardTaglinePremium: {
    color: '#8AABAB',
  },

  precoContainer: {
    alignItems: 'flex-end',
  },
  preco: {
    fontSize: 26,
    fontWeight: '700',
    color: PETROLEO,
    letterSpacing: -1,
  },
  precoPremium: {
    color: GOLD,
  },
  periodo: {
    fontSize: 12,
    color: TEXT_MID,
    marginTop: -2,
  },
  periodoPremium: {
    color: '#8AABAB',
  },

  // Divisor
  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardDividerPremium: {
    backgroundColor: '#1E4040',
  },

  // Corpo
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 10,
  },
  beneficioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PETROLEO_BG,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkCirclePremium: {
    backgroundColor: '#1E4040',
  },
  checkIcon: {
    fontSize: 12,
    color: PETROLEO,
    fontWeight: '700',
  },
  checkIconPremium: {
    color: GOLD,
  },
  beneficioText: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 20,
    flex: 1,
  },
  beneficioTextPremium: {
    color: '#C8DCDC',
  },

  // Rodapé do card
  cardFooter: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: PETROLEO_BG,
  },
  cardFooterNormalSelecionado: {
    backgroundColor: PETROLEO,
  },
  cardFooterPremiumSelecionado: {
    backgroundColor: GOLD,
  },
  cardFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: PETROLEO,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardFooterTextSelecionado: {
    color: WHITE,
  },

  // ─── Info box ─────────────────────────────────────────────────────────────
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 16,
    backgroundColor: PETROLEO_BG,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: PETROLEO,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: PETROLEO,
    lineHeight: 18,
  },

  // ─── Footer ───────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: PETROLEO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    shadowColor: PETROLEO,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    minWidth: 280,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: BORDER,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrowRight: {
    color: WHITE,
    fontSize: 18,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: PETROLEO_VIVO,
    fontSize: 14,
    fontWeight: '500',
  },
});