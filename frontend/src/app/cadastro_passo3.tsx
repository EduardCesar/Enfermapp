import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/api';

const { height } = Dimensions.get('window');

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
// ───────────────────────────────────────────────────────────────────────────────

export default function CadastroPasso3() {
  const router = useRouter();
  const { tipo_conta, nome_usuario, senha } = useLocalSearchParams();

  const [cidade, setCidade] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const cidades = ['Mococa, SP'];
  const stepCount = tipo_conta === 'profissional' ? '5' : '3';
  const progress = tipo_conta === 'profissional' ? 60 : 100;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = async () => {
    if (!cidade) {
      Alert.alert("Atenção", "Por favor, selecione sua cidade.");
      return;
    }

    animateButton();
    setLoading(true);
    
    try {
      let idUsuarioGerado;

      const { data: novoUsuario, error: errorUser } = await supabase
        .from('usuario')
        .insert([{ 
          nome_usuario, 
          senha, 
          tipo_conta, 
          cidade, 
          status_conta: tipo_conta === 'profissional' ? 'pendente' : 'ativa' 
        }])
        .select()
        .single();

      if (errorUser) {
        if (errorUser.code === '23505') {
          const { data: usuarioExistente, error: errorBusca } = await supabase
            .from('usuario')
            .select('id_usuario')
            .eq('nome_usuario', nome_usuario)
            .single();
          
          if (usuarioExistente) {
            idUsuarioGerado = usuarioExistente.id_usuario;
          } else {
            throw new Error("Erro ao recuperar dados.");
          }
        } else {
          throw errorUser;
        }
      } else {
        idUsuarioGerado = novoUsuario.id_usuario;
      }

      if (tipo_conta === 'profissional') {
        const { data: profExistente } = await supabase
          .from('profissional')
          .select('id_profissional')
          .eq('id_usuario', idUsuarioGerado)
          .single();

        let idProfissional;

        if (!profExistente) {
          const { data: novoProf, error: errorProf } = await supabase
            .from('profissional')
            .insert([{ 
              id_usuario: idUsuarioGerado,
              status_aprovacao: 'pendente',
              status_pagamento: 'pendente'
            }])
            .select()
            .single();

          if (errorProf) throw errorProf;
          idProfissional = novoProf.id_profissional;
        } else {
          idProfissional = profExistente.id_profissional;
        }

        router.push({
          pathname: '/cadastro_passo4',
          params: { 
            tipo_conta, 
            id_usuario: String(idUsuarioGerado), 
            id_profissional: String(idProfissional),
            cidade 
          }
        });

      } else {
        Alert.alert(
          "🎉 Cadastro concluído!",
          `Bem-vinda(o), ${nome_usuario}!\n\nSeu acesso já está liberado.`,
          [{ text: "Começar", onPress: () => router.replace('/login') }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const selectCidade = (item) => {
    setCidade(item);
    setShowDropdown(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepNumber}>03</Text>
          <View style={styles.stepDivider}>
            <Text style={styles.stepDividerText}>/</Text>
            <Text style={styles.stepTotal}>{stepCount}</Text>
          </View>
          <Text style={styles.stepLabel}>Localização</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Onde você</Text>
          <Text style={styles.titleAccent}>está?</Text>
        </View>

        {/* City Selection Cards */}
        <View style={styles.citySection}>
          <Text style={styles.sectionLabel}>Cidade atendida</Text>
          
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.cityCard,
              !cidade && styles.cityCardEmpty,
              cidade && styles.cityCardSelected
            ]}
            onPress={() => setShowDropdown(true)}
            disabled={loading}
          >
            <View style={styles.cityCardContent}>
              <View style={[
                styles.iconCircle,
                cidade && styles.iconCircleActive
              ]}>
                <Text style={styles.iconText}>📍</Text>
              </View>
              <View style={styles.cityInfo}>
                <Text style={[
                  styles.cityName,
                  !cidade && styles.cityNamePlaceholder
                ]}>
                  {cidade || "Toque para selecionar"}
                </Text>
                {cidade && (
                  <Text style={styles.cityState}>São Paulo, Brasil</Text>
                )}
              </View>
              <View style={[
                styles.arrowContainer,
                cidade && styles.arrowContainerActive
              ]}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Location hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintIcon}>ℹ️</Text>
            <Text style={styles.hintText}>
              No momento, estamos disponíveis apenas em Mococa, SP
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.actionButton,
                (!cidade || loading) && styles.actionButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!cidade || loading}
            >
              {loading ? (
                <ActivityIndicator color={WHITE} size="small" />
              ) : (
                <>
                  <Text style={styles.actionButtonText}>
                    {tipo_conta === 'profissional' ? 'Continuar' : 'Finalizar'}
                  </Text>
                  <Text style={styles.arrowRight}>
                    {tipo_conta === 'profissional' ? '→' : '✓'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {!loading && (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* City Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Selecione sua cidade</Text>
            
            {cidades.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.modalOption,
                  cidade === item && styles.modalOptionSelected
                ]}
                onPress={() => selectCidade(item)}
              >
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionIcon}>📍</Text>
                  <View style={styles.modalOptionText}>
                    <Text style={[
                      styles.modalCityName,
                      cidade === item && styles.modalCityNameSelected
                    ]}>
                      {item}
                    </Text>
                    <Text style={styles.modalCityState}>São Paulo</Text>
                  </View>
                  {cidade === item && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDropdown(false)}
            >
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // Progress bar
  progressBarContainer: {
    height: 4,
    backgroundColor: BORDER,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PETROLEO,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
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

  // Title
  titleSection: {
    marginBottom: 40,
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

  // City Section
  citySection: {
    marginBottom: 'auto',
  },
  sectionLabel: {
    fontSize: 14,
    color: OLIVA,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  cityCardEmpty: {
    borderStyle: 'dashed',
    borderColor: BORDER,
    borderWidth: 2,
  },
  cityCardSelected: {
    borderColor: PETROLEO,
    backgroundColor: PETROLEO_BG,
  },
  cityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: PETROLEO_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircleActive: {
    backgroundColor: PETROLEO,
  },
  iconText: {
    fontSize: 24,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  cityNamePlaceholder: {
    color: '#ABABAB',
    fontWeight: '400',
  },
  cityState: {
    fontSize: 13,
    color: TEXT_MID,
    marginTop: 4,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PETROLEO_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainerActive: {
    backgroundColor: PETROLEO,
  },
  arrow: {
    fontSize: 22,
    color: PETROLEO,
    fontWeight: '600',
  },

  // Hint box
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 16,
    backgroundColor: PETROLEO_BG,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: PETROLEO,
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 18,
  },

  // Footer
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 30,
  },
  actionButton: {
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
    minWidth: 260,
  },
  actionButtonDisabled: {
    backgroundColor: BORDER,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrowRight: {
    color: WHITE,
    fontSize: 18,
    marginLeft: 8,
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 77, 77, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: height * 0.6,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalOptionSelected: {
    backgroundColor: OLIVA_BG,
    borderColor: PETROLEO,
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalCityName: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  modalCityNameSelected: {
    color: PETROLEO,
  },
  modalCityState: {
    fontSize: 13,
    color: TEXT_MID,
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PETROLEO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: PETROLEO_BG,
  },
  closeText: {
    color: PETROLEO,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});