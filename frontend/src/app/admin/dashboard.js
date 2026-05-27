 import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Paleta de cores extraída fielmente da imagem
const BG_CREAM     = '#F7F5F0';
const PETROLEO     = '#1B4D4D';
const OLIVA        = '#5C6B2E';
const WHITE        = '#FFFFFF';
const TEXT_DARK    = '#1A1A1A';
const TEXT_MUTED   = '#6B6B6B';

export default function DashboardAdmin() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Cabeçalho */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            Bem-Vindo(a) ao painel{'\n'}de administrador
          </Text>
          <Text style={styles.subtitle}>
            Selecione uma das opções abaixo:
          </Text>
        </View>

        {/* Botões Principais no estilo Pílula da imagem */}
        <View style={styles.buttonContainer}>
          {/* Botão Aprovações (Petróleo) */}
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.button, styles.buttonPetroleo]}
            onPress={() => router.push('/admin/aprovacoes')}
          >
            <Text style={styles.buttonText}>APROVAÇÕES PENDENTES</Text>
          </TouchableOpacity>

          {/* Botão Intercorrências (Oliva) */}
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.button, styles.buttonOliva]}
            onPress={() => router.push('/admin/intercorrencias')}
          >
            <Text style={styles.buttonText}>INTERCORRÊNCIAS PENDENTES</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Sair */}
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.logoutButton} 
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_CREAM, // Fundo idêntico ao da imagem
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente como no print
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '300', // Fonte mais fina e elegante seguindo o estilo "Enfermapp"
    textAlign: 'center',
    color: TEXT_DARK,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16, // Espaçamento consistente entre os botões
  },
  button: {
    width: '100%',
    height: 60, // Altura ideal para o formato pílula confortável ao toque
    borderRadius: 30, // Cantos totalmente arredondados (estilo pílula do print)
    justifyContent: 'center',
    alignItems: 'center',
    
    // Sombra suave idêntica à da imagem (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 4,
  },
  buttonPetroleo: {
    backgroundColor: PETROLEO,
  },
  buttonOliva: {
    backgroundColor: OLIVA,
  },
  buttonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700', // Caixa alta com peso marcante
    letterSpacing: 1.5, // Espaçamento entre as letras para melhor legibilidade
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 40,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: TEXT_MUTED,
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline', // Sublinhado discreto para o botão sair
  }
});