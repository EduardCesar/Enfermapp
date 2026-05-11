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
                  <View style={styles.optionIcon}>
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
              <Text style={styles.nextButtonText}>
                Continuar
              </Text>
              <Text style={styles.arrowRight}>→</Text>
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff0f5', // Lavender Blush - fundo rosa bem claro
  },
  
  // Progress bar
  progressBarContainer: {
    height: 3,
    backgroundColor: '#fce4ec', // Rosa bem claro
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e91e63', // Pink 500
  },

  content: { 
    flex: 1, 
    paddingHorizontal: 28,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: '#e91e63', // Pink principal
    letterSpacing: -2,
  },
  stepDivider: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 4,
  },
  stepDividerText: {
    fontSize: 24,
    color: '#ad1457', // Pink escuro
    fontWeight: '300',
  },
  stepTotal: {
    fontSize: 20,
    color: '#c2185b', // Pink médio
    fontWeight: '400',
    marginLeft: 2,
  },
  stepLabel: {
    fontSize: 14,
    color: '#880e4f', // Pink mais escuro
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Título
  titleSection: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4a148c', // Roxo escuro para contraste
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '300',
    color: '#e91e63', // Pink principal
    letterSpacing: -0.5,
  },

  // Dropdown
  dropdownWrapper: {
    marginBottom: 'auto',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f8bbd0', // Rosa claro
    overflow: 'hidden',
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownActive: {
    borderColor: '#e91e63', // Pink principal
  },
  dropdownSelected: {
    backgroundColor: '#fff0f5', // Lavender blush
    borderColor: '#c2185b',
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
    color: '#4a148c', // Roxo escuro
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9e9e9e',
    fontWeight: '400',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fce4ec', // Rosa claro
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#e91e63', // Pink principal
  },

  // Options
  optionsContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f8bbd0', // Rosa claro
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fce4ec',
  },
  optionFirst: {
    borderTopWidth: 0,
  },
  optionSelected: {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fce4ec', // Rosa claro
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    color: '#4a148c', // Roxo escuro
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#e91e63', // Pink principal
  },
  optionDescription: {
    fontSize: 13,
    color: '#9e9e9e',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e91e63', // Pink principal
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    paddingBottom: 40,
  },
  nextButton: { 
    backgroundColor: '#e91e63', // Pink 500 - botão principal
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#f8bbd0', // Rosa claro desabilitado
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
  hintText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    color: '#ad1457', // Pink escuro
  },
});