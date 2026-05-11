import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CadastroPasso2() {
  const router = useRouter();
  const { tipo_conta } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const stepCount = tipo_conta === 'profissional' ? '5' : '3';
  const progress = 40; // 40% - passo 2 de 5 ou 3

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const validateAndProceed = () => {
    animateButton();
    if (!nome.trim() || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Senhas diferentes", "As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    router.push({
      pathname: '/cadastro_passo3',
      params: { tipo_conta, nome_usuario: nome.trim(), senha }
    });
  };

  // Força de senha visual
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, color: '#e0e0e0', text: '' };
    if (pwd.length < 6) return { strength: 25, color: '#ff5252', text: 'Fraca' };
    if (pwd.length < 10) return { strength: 50, color: '#ffab40', text: 'Média' };
    return { strength: 100, color: '#69f0ae', text: 'Forte' };
  };

  const pwdStrength = getPasswordStrength(senha);

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.stepNumber}>02</Text>
              <View style={styles.stepDivider}>
                <Text style={styles.stepDividerText}>/</Text>
                <Text style={styles.stepTotal}>{stepCount}</Text>
              </View>
              <Text style={styles.stepLabel}>Sua conta</Text>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Quase lá,</Text>
              <Text style={styles.titleAccent}>{tipo_conta === 'profissional' ? 'pro!' : 'cliente!'}</Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              
              {/* Username */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Nome de usuário</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'nome' && styles.inputFocused,
                  nome.length > 0 && styles.inputFilled
                ]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: maria_silva"
                    placeholderTextColor="#9e9e9e"
                    value={nome}
                    onChangeText={setNome}
                    onFocus={() => setFocusedField('nome')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={30}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Crie uma senha</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'senha' && styles.inputFocused,
                  senha.length > 0 && styles.inputFilled
                ]}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#9e9e9e"
                    value={senha}
                    onChangeText={setSenha}
                    onFocus={() => setFocusedField('senha')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!mostrarSenha}
                    maxLength={20}
                  />
                  <TouchableOpacity 
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIcon}>
                      {mostrarSenha ? '👁️' : '🙈'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Password strength bar */}
                {senha.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBg}>
                      <View style={[
                        styles.strengthBarFill,
                        { width: `${pwdStrength.strength}%`, backgroundColor: pwdStrength.color }
                      ]} />
                    </View>
                    <Text style={[styles.strengthText, { color: pwdStrength.color }]}>
                      {pwdStrength.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirme sua senha</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'confirmar' && styles.inputFocused,
                  confirmarSenha.length > 0 && styles.inputFilled,
                  confirmarSenha.length > 0 && confirmarSenha === senha && styles.inputMatch
                ]}>
                  <Text style={styles.inputIcon}>✓</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repita a senha"
                    placeholderTextColor="#9e9e9e"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    onFocus={() => setFocusedField('confirmar')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!mostrarSenha}
                    maxLength={20}
                  />
                  {confirmarSenha === senha && confirmarSenha.length > 0 && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>

            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.nextButton,
                    (!nome || !senha || !confirmarSenha) && styles.nextButtonDisabled
                  ]}
                  onPress={validateAndProceed}
                  disabled={!nome || !senha || !confirmarSenha}
                >
                  <Text style={styles.nextButtonText}>Continuar</Text>
                  <Text style={styles.arrowRight}>→</Text>
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
      </KeyboardAvoidingView>
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
    backgroundColor: '#e91e63', // Pink 500
  },

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
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
    fontWeight: '400',
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

  // Form
  formSection: {
    marginBottom: 'auto',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#880e4f',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f8bbd0',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputFocused: {
    borderColor: '#e91e63',
    shadowColor: '#e91e63',
    shadowOpacity: 0.12,
  },
  inputFilled: {
    borderColor: '#c2185b',
  },
  inputMatch: {
    borderColor: '#69f0ae',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4a148c',
    fontWeight: '500',
  },
  passwordInput: {
    letterSpacing: 1,
  },
  eyeButton: {
    padding: 8,
    marginLeft: -8,
  },
  eyeIcon: {
    fontSize: 22,
  },

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#fce4ec',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Match badge
  matchBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#69f0ae',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  nextButton: {
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
    minWidth: 240,
  },
  nextButtonDisabled: {
    backgroundColor: '#f8bbd0',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
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
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f8bbd0',
  },
  backText: {
    color: '#ad1457',
    fontSize: 14,
    fontWeight: '500',
  },
});