import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Image, 
  Alert,
  Animated,
  ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/api';

export default function CadastroPasso4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [image, setImage] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlFinal, setUrlFinal] = useState(null);
  const [documentoAprovado, setDocumentoAprovado] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isWaiting && params.id_profissional) {
      console.log("Iniciando escuta para o profissional:", params.id_profissional);

      const channel = supabase
        .channel('check_aprovacao')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE',
            schema: 'public',
            table: 'profissional',
            filter: `id_profissional=eq.${params.id_profissional}`
          },
          (payload) => {
            console.log("Mudança detectada:", payload.new.status_aprovacao);
            if (payload.new.status_aprovacao === 'aprovado') {
              setDocumentoAprovado(true);
            }
          }
        )
        .subscribe((status) => {
          console.log("Status da conexão Realtime:", status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isWaiting, params.id_profissional]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão Necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!image) {
      Alert.alert("Atenção", "Por favor, anexe a imagem do seu COREN.");
      return;
    }

    animateButton();
    setIsUploading(true);

    try {
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `coren_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('documentos_profissionais')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('documentos_profissionais')
        .getPublicUrl(fileName);

      const url = publicData.publicUrl;
      setUrlFinal(url);

      const { error: updateError } = await supabase
        .from('profissional')
        .update({ 
          coren_url: url, 
          status_aprovacao: 'pendente' 
        })
        .eq('id_profissional', params.id_profissional);

      if (updateError) throw updateError;

      setIsWaiting(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não conseguimos salvar a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  // Tela de aguardando aprovação
  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Progress bar - 80% no passo 4 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: '80%' }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            
            <View style={styles.header}>
              <Text style={styles.stepNumber}>04</Text>
              <View style={styles.stepDivider}>
                <Text style={styles.stepDividerText}>/</Text>
                <Text style={styles.stepTotal}>5</Text>
              </View>
              <Text style={styles.stepLabel}>Verificação</Text>
            </View>

            <View style={styles.waitingCard}>
              {!documentoAprovado ? (
                <>
                  <View style={styles.statusCirclePending}>
                    <ActivityIndicator size="large" color="#e91e63" />
                  </View>
                  <Text style={styles.waitingTitle}>Análise em andamento</Text>
                  <Text style={styles.waitingDescription}>
                    Nossa equipe está revisando seu documento COREN.
                    {'\n'}
                    Você será notificado assim que for aprovado.
                  </Text>
                  <View style={styles.pulseDots}>
                    <Animated.View style={[styles.dot, styles.dot1]} />
                    <Animated.View style={[styles.dot, styles.dot2]} />
                    <Animated.View style={[styles.dot, styles.dot3]} />
                  </View>
                  
                  {/* Verificação manual */}
                  <TouchableOpacity 
                    onPress={async () => {
                      const { data } = await supabase
                        .from('profissional')
                        .select('status_aprovacao')
                        .eq('id_profissional', params.id_profissional)
                        .single();
                      if (data?.status_aprovacao === 'aprovado') setDocumentoAprovado(true);
                    }}
                    style={styles.manualCheck}
                  >
                    <Text style={styles.manualCheckText}>Verificar status</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.statusCircleApproved}>
                    <Text style={styles.approvedIcon}>✓</Text>
                  </View>
                  <Text style={styles.approvedTitle}>Documento Aprovado! 🎉</Text>
                  <Text style={styles.approvedDescription}>
                    Seu registro COREN foi verificado com sucesso.
                  </Text>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={() => router.push({
                        pathname: '/cadastro_passo5',
                        params: { ...params, coren_url: urlFinal } 
                      })}
                    >
                      <Text style={styles.continueButtonText}>Escolher Plano</Text>
                      <Text style={styles.arrowRight}>→</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              )}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Tela de upload
  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar - 80% */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: '80%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepNumber}>04</Text>
            <View style={styles.stepDivider}>
              <Text style={styles.stepDividerText}>/</Text>
              <Text style={styles.stepTotal}>5</Text>
            </View>
            <Text style={styles.stepLabel}>Documentação</Text>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Verificação</Text>
            <Text style={styles.titleAccent}>profissional</Text>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionLabel}>Carteirinha COREN</Text>
            
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.uploadCard}
              onPress={pickImage}
              disabled={isUploading}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.uploadIconCircle}>
                    <Text style={styles.uploadIcon}>📷</Text>
                  </View>
                  <Text style={styles.uploadTitle}>Toque para anexar</Text>
                  <Text style={styles.uploadSubtitle}>
                    Foto da carteirinha COREN{'\n'}frente ou verso
                  </Text>
                </View>
              )}
              
              {image && (
                <View style={styles.changeOverlay}>
                  <Text style={styles.changeText}>📸 Trocar imagem</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={styles.infoText}>
                Seu documento é criptografado e usado apenas para validação. 
                Não será compartilhado.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.sendButton,
                  (!image || isUploading) && styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={!image || isUploading}
              >
                {isUploading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.sendButtonText}>Enviando...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.sendButtonText}>
                      {image ? 'Enviar documento' : 'Selecione uma imagem'}
                    </Text>
                    <Text style={styles.arrowRight}>
                      {image ? '→' : ''}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {!isUploading && (
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <Text style={styles.backText}>← Voltar</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f5',
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

  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 28,
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
    marginBottom: 32,
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

  // Upload Section
  uploadSection: {
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
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 280,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f8bbd0',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 36,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e91e63',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(74, 20, 140, 0.85)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  changeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6366f1',
    lineHeight: 18,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  sendButton: {
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
    minWidth: 280,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f8bbd0',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  arrowRight: {
    color: '#ffffff',
    fontSize: 18,
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

  // Waiting Card
  waitingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  statusCirclePending: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fce4ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusCircleApproved: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#69f0ae',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  approvedIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '700',
  },
  waitingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4a148c',
    marginBottom: 12,
  },
  waitingDescription: {
    fontSize: 14,
    color: '#6b6b7b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  approvedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00c853',
    marginBottom: 12,
  },
  approvedDescription: {
    fontSize: 14,
    color: '#6b6b7b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#00c853',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#00c853',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pulseDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e91e63',
  },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 1 },
  manualCheck: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f8bbd0',
  },
  manualCheckText: {
    color: '#ad1457',
    fontSize: 13,
    fontWeight: '500',
  },
});