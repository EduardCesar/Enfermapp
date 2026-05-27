import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../../services/api';

// Paleta de cores combinando o Verde Oliva Vivo e o Azul Petróleo
const CREAM = '#FDFBF7';        // Fundo claro e refinado
const VERDE_VIVO = '#2E6F40';   // Verde Oliva bem visível para títulos e ícones
const PETROLEO = '#0F262E';     // Azul Petróleo escuro para elementos de destaque e textos
const TEXT_MID = '#768A7E';     // Tom intermediário para legendas secundárias
const BORDER = '#E3E8E5';       // Borda sutil para os cards
const WHITE = '#FFFFFF';

export default function DashboardCliente() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, [])
  );

  async function getProfile() {
    try {
      setLoading(true);
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      if (!nomeSalvo) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('usuario')
        .select('foto_perfil')
        .eq('nome_usuario', nomeSalvo) 
        .single();

      if (error) throw error;

      if (data && data.foto_perfil) {
        setAvatarUrl(data.foto_perfil);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.log('Erro ao carregar foto no Dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={[styles.avatarCircle, avatarUrl ? styles.avatarCircleFilled : null]}>
            {loading ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Ionicons name="person" size={24} color={WHITE} />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bem-vindo de volta</Text>
            <Text style={styles.title}>Painel do Profissional</Text>
          </View>
        </View>

        {/* GRID DE BOTÕES */}
        <View style={styles.menuSection}>
          <View style={styles.grid}>
            {/* BOTÃO PERFIL */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/profissional/perfil')}>
              <Ionicons name="person" size={28} color={VERDE_VIVO} />
              <Text style={styles.buttonText}>Perfil</Text>
            </TouchableOpacity>

           
          </View>

          <View style={styles.grid}>
            {/* BOTÃO AGENDA */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/profissional/agenda')}>
              <Ionicons name="calendar" size={28} color={VERDE_VIVO} />
              <Text style={styles.buttonText}>Agenda</Text>
            </TouchableOpacity>

            {/* BOTÃO NOTIFICAÇÕES */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/profissional/notificacoes')}>
              <Ionicons name="notifications" size={28} color={VERDE_VIVO} />
              <Text style={styles.buttonText}>Avisos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER / BOTÃO SAIR */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnSair} onPress={() => router.replace('/login')}>
            <Ionicons name="exit-outline" size={18} color="#C94A4A" />
            <Text style={styles.btnSairText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: CREAM,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PETROLEO, // Base do avatar em Azul Petróleo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: PETROLEO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircleFilled: {
    borderColor: VERDE_VIVO, // Borda em Verde Vivo quando há foto
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  headerText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    color: TEXT_MID,
    marginBottom: 2,
    letterSpacing: 1.2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: VERDE_VIVO, // Título principal em destaque no Verde Vivo
    letterSpacing: -0.5,
  },
  menuSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 'auto',
  },
  grid: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    height: 120,
    backgroundColor: WHITE, 
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: PETROLEO, // Sombra sutil em Azul Petróleo para profundidade
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: { 
    color: PETROLEO, // Texto interno dos botões em Azul Petróleo para contraste limpo
    marginTop: 12, 
    fontWeight: '600', 
    fontSize: 15,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  btnSair: { 
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    width: '100%',
  },
  btnSairText: {
    color: '#C94A4A', 
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  }
});