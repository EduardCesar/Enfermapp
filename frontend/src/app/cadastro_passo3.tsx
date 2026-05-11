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
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const selectCidade = (item: string) => {
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
                <ActivityIndicator color="#fff" size="small" />
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
    backgroundColor: '#fff0f5', // Lavender Blush
  },

  // Progress bar
  progressBarContainer: {
    height: 3,
    backgroundColor: '#fce4ec',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e91e63',
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
    color: '#e91e63',
    letterSpacing: -2,
  },
  stepDivider: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 4,
  },
  stepDividerText: {
    fontSize: 24,
    color: '#ad1457',
    fontWeight: '300',
  },
  stepTotal: {
    fontSize: 20,
    color: '#c2185b',
    marginLeft: 2,
  },
  stepLabel: {
    fontSize: 14,
    color: '#880e4f',
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Title
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4a148c',
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '300',
    color: '#e91e63',
    letterSpacing: -0.5,
  },

  // City Section
  citySection: {
    marginBottom: 'auto',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#880e4f',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#f8bbd0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cityCardEmpty: {
    borderStyle: 'dashed',
    borderColor: '#f8bbd0',
    borderWidth: 2,
  },
  cityCardSelected: {
    borderColor: '#e91e63',
    backgroundColor: '#fff5f7',
  },
  cityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircleActive: {
    backgroundColor: '#e91e63',
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
    color: '#4a148c',
  },
  cityNamePlaceholder: {
    color: '#9e9e9e',
    fontWeight: '400',
  },
  cityState: {
    fontSize: 13,
    color: '#ad1457',
    marginTop: 4,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainerActive: {
    backgroundColor: '#e91e63',
  },
  arrow: {
    fontSize: 22,
    color: '#c2185b',
    fontWeight: '600',
  },

  // Hint box
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(233, 30, 99, 0.06)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#e91e63',
  },
  hintIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#ad1457',
    lineHeight: 18,
  },

  // Footer
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: '#e91e63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 260,
  },
  actionButtonDisabled: {
    backgroundColor: '#f8bbd0',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  arrowRight: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backText: {
    color: '#ad1457',
    fontSize: 14,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 20, 140, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4a148c',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalOptionSelected: {
    backgroundColor: '#fff5f7',
    borderColor: '#e91e63',
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
    color: '#4a148c',
  },
  modalCityNameSelected: {
    color: '#e91e63',
  },
  modalCityState: {
    fontSize: 13,
    color: '#9e9e9e',
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fce4ec',
  },
  closeText: {
    color: '#c2185b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});