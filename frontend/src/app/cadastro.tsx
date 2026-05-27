import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  Animated,
  Easing 
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const router = useRouter(); 
  const [tipo, setTipo] = useState(''); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    animateButton();
    if (!tipo) {
      Alert.alert("Atenção", "Por favor, selecione o tipo de conta."); 
      return;
    }
    
    router.push({
      pathname: '/cadastro_passo2',
      params: { tipo_conta: tipo.toLowerCase() } 
    }); 
  }; 

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectOption = (item: string) => {
    setTipo(item); 
    setShowDropdown(false);
  };

  const stepCount = tipo.toLowerCase() === 'profissional' ? '5' : '3';
  const progress = tipo ? 1 : 0;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Barra de progresso */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${(progress / 1) * 20}%` }]} />
      </View>

      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepNumber}>01</Text>
          <View style={styles.stepDivider}>
            <Text style={styles.stepDividerText}>/</Text>
            <Text style={styles.stepTotal}>{stepCount}</Text>
          </View>
          <Text style={styles.stepLabel}>Escolha seu perfil</Text>
        </View>

        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Como você quer</Text>
          <Text style={styles.titleAccent}>usar o app?</Text>
        </View>

        {/* Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
              styles.dropdown, 
              showDropdown && styles.dropdownActive,
              tipo && styles.dropdownSelected
            ]} 
            onPress={toggleDropdown}
          >
            <View style={styles.dropdownContent}>
              <Text style={[
                styles.dropdownText, 
                !tipo && styles.dropdownPlaceholder
              ]}>
                {tipo || "Selecione uma opção"}
              </Text>
              <View style={styles.arrowContainer}>
                <Animated.Text style={[
                  styles.arrow,
                  { transform: [{ rotate: showDropdown ? '180deg' : '0deg' }] }
                ]}>
                  ▼
                </Animated.Text>
              </View>
            </View>
          </TouchableOpacity> 

          {showDropdown && (
            <View style={styles.optionsContainer}>
              {[
                { label: 'Cliente', desc: 'Quero contratar serviços', icon: '👤' },
                { label: 'Profissional', desc: 'Quero oferecer serviços', icon: '🔧' }
              ].map((item, index) => (
                <TouchableOpacity 
                  key={item.label} 
                  activeOpacity={0.7}
                  style={[
                    styles.option,
                    index === 0 && styles.optionFirst,
                    tipo === item.label && styles.optionSelected
                  ]} 
                  onPress={() => selectOption(item.label)}
                >
                  <View style={[
                    styles.optionIcon,
                    tipo === item.label && styles.optionIconSelected
                  ]}>
                    <Text style={styles.optionIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionTitle,
                      tipo === item.label && styles.optionTitleSelected
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={styles.optionDescription}>{item.desc}</Text>
                  </View>
                  {tipo === item.label && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[
                styles.nextButton,
                !tipo && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!tipo}
            >
              <Text style={[
                styles.nextButtonText,
                !tipo && styles.nextButtonTextDisabled
              ]}>
                Continuar
              </Text>
              <Text style={[
                styles.arrowRight,
                !tipo && styles.nextButtonTextDisabled
              ]}>→</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.hintText}>
            {tipo ? 'Ótima escolha!' : 'Selecione uma opção para continuar'}
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── PALETA PETRÓLEO + OLIVA ──────────────────────────────────────────────────
// Petróleo:      #1B4D4D  Azul petróleo escuro — SABOR PRINCIPAL
// Petróleo vivo: #2A7A7A  Petróleo mais claro — destaques vivos
// Petróleo bg:   #E0EBEB  Petróleo diluído — fundos sutis
// Oliva:         #5C6B2E  Verde oliva — tempero e detalhes
// Oliva viva:    #7A8F3A  Oliva mais claro — acento secundário
// Oliva bg:      #ECF0DC  Oliva diluído — seleção suave
// Fundo:         #F7F5F0  Creme quente
// Texto:         #1A1A1A  Quase preto
// Subtexto:      #6B6B6B  Cinza médio
// Borda:         #E0DDD6  Cinza quente
// ───────────────────────────────────────────────────────────────────────────────

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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: CREAM,
  },
  
  progressBarContainer: {
    height: 4,
    backgroundColor: BORDER,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PETROLEO, // ← petróleo na barra
  },

  content: { 
    flex: 1, 
    paddingHorizontal: 28,
    paddingTop: 60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: PETROLEO, // ← petróleo no número
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
    color: OLIVA, // ← oliva no label superior
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  titleSection: {
    marginBottom: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 34,
    fontWeight: '300',
    color: PETROLEO_VIVO, // ← petróleo vivo no destaque
    letterSpacing: -0.5,
  },

  dropdownWrapper: {
    marginBottom: 'auto',
  },
  dropdown: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownActive: {
    borderColor: PETROLEO, // ← petróleo quando aberto
    borderWidth: 2,
  },
  dropdownSelected: {
    borderColor: OLIVA, // ← oliva quando selecionado
    borderWidth: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#ABABAB',
    fontWeight: '400',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PETROLEO_BG, // ← petróleo diluído na seta
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 11,
    color: PETROLEO, // ← petróleo na setinha
  },

  optionsContainer: {
    marginTop: 8,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDE8',
  },
  optionFirst: {
    borderTopWidth: 0,
  },
  optionSelected: {
    backgroundColor: OLIVA_BG, // ← oliva diluído na seleção
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconSelected: {
    backgroundColor: PETROLEO_BG, // ← petróleo bg no ícone ativo
  },
  optionIconText: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 3,
  },
  optionTitleSelected: {
    color: PETROLEO, // ← petróleo no título selecionado
  },
  optionDescription: {
    fontSize: 13,
    color: TEXT_MID,
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PETROLEO, // ← petróleo no checkmark
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    paddingBottom: 40,
  },
  nextButton: { 
    backgroundColor: PETROLEO, // ← petróleo no botão CTA (SABOR!)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: PETROLEO,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: BORDER,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: { 
    color: WHITE, // branco puro sobre petróleo escuro
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextButtonTextDisabled: {
    color: TEXT_MID,
  },
  arrowRight: {
    color: WHITE,
    fontSize: 18,
    marginLeft: 8,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    color: OLIVA_VIVA, // ← oliva viva no hint
    fontWeight: '500',
  },
});