import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paleta de Cores Atualizada e Integrada
const CREAM = '#FDFBF7';        // Fundo padrão
const VERDE_VIVO = '#2E6F40';   // Detalhes em Oliva
const PETROLEO = '#0F262E';     // Textos principais e cabeçalhos
const TEXT_MID = '#6E828A';     // Subtítulos e labels secundárias
const BORDER = '#E3E8E5';       // Bordas sutis
const WHITE = '#FFFFFF';

// Cores de Destaque Alternativas (Sem ser Verde ou Azul)
const TERRACOTA = '#B85A3A';    // Substitui o Rosa antigo em botões e seleções
const MOSTARDA = '#D99100';     // Substitui o Amarelo vivo na tela de sucesso por algo mais elegante

export default function AgendarServico() {
  const router = useRouter();
  const { idProfissional, servicoId } = useLocalSearchParams();
  
  const [passo, setPasso] = useState(1); // 1: Form, 2: Revisão, 3: Sucesso
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hora: '',
    descricao: '',
    endereco: '',
    pagamento: 'Dinheiro' // Valor padrão inicial
  });

  // Função para aplicar máscara de horário (HH:MM)
  const formatarHora = (text) => {
    const nums = text.replace(/[^\d]/g, '');
    let formatted = nums;
    if (nums.length > 2) {
      formatted = `${nums.slice(0, 2)}:${nums.slice(2, 4)}`;
    }
    setForm({ ...form, hora: formatted.slice(0, 5) });
  };

  const finalizarAgendamento = async () => {
    setLoading(true);
    try {
      const nomeLogado = await AsyncStorage.getItem('nome_logado');
      const { data: user } = await supabase.from('usuario').select('id_usuario').eq('nome_usuario', nomeLogado).single();

      const { error } = await supabase.from('agendamentos').insert([{
        id_cliente: user.id_usuario,
        id_profissional: parseInt(idProfissional),
        id_servico: parseInt(servicoId),
        data_agendamento: new Date().toISOString().split('T')[0],
        hora_agendamento: form.hora,
        status: 'pendente',
        endereco: form.endereco,
        observacao: form.descricao,
        metodo_pagamento: form.pagamento
      }]);

      if (error) throw error;
      setPasso(3);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PASSO 1: FORMULÁRIO ---
  if (passo === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-outline" size={32} color="#C94A4A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Procedimento</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Horário Desejado</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 14:30" 
            placeholderTextColor={TEXT_MID}
            keyboardType="numeric"
            value={form.hora} 
            onChangeText={formatarHora}
          />
          
          <Text style={styles.label}>O que você precisa?</Text>
          <TextInput 
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]} 
            multiline 
            placeholder="Descreva detalhes do que precisa aqui..." 
            placeholderTextColor={TEXT_MID}
            value={form.descricao} 
            onChangeText={(t) => setForm({...form, descricao: t})}
          />
          
          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Rua, número, bairro..." 
            placeholderTextColor={TEXT_MID}
            value={form.endereco} 
            onChangeText={(t) => setForm({...form, endereco: t})}
          />
          
          {/* SELEÇÃO DE PAGAMENTO */}
          <Text style={styles.label}>Forma de Pagamento</Text>
          <View style={styles.pagamentoContainer}>
            {['Dinheiro', 'Pix', 'Cartão (na hora)'].map((opcao) => (
              <TouchableOpacity 
                key={opcao} 
                style={styles.radioOption} 
                onPress={() => setForm({...form, pagamento: opcao})}
              >
                <View style={[styles.radioCircle, form.pagamento === opcao && styles.radioSelected]} />
                <Text style={styles.radioText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.mainButton, { marginTop: 30 }]} 
            activeOpacity={0.8}
            onPress={() => {
              if(!form.hora || !form.endereco) return Alert.alert("Aviso", "Preencha horário e endereço!");
              if(form.hora.length < 5) return Alert.alert("Aviso", "Horário incompleto!");
              setPasso(2);
            }}
          >
            <Text style={styles.mainButtonText}>REVISAR DADOS</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- PASSO 2: CONFIRMAÇÃO DE DADOS ---
  if (passo === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPasso(1)}>
            <Ionicons name="arrow-back" size={26} color={PETROLEO} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirme seus Dados</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.revisaoCard}>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Horário:</Text> {form.hora}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Endereço:</Text> {form.endereco}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Pagamento:</Text> {form.pagamento}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Obs:</Text> {form.descricao || "Nenhuma observação adicionada."}</Text>
          </View>

          <TouchableOpacity style={styles.mainButton} activeOpacity={0.8} onPress={finalizarAgendamento}>
            {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.mainButtonText}>CONFIRMAR E SOLICITAR</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- PASSO 3: TELA DE ESPERA ---
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}>
      <Ionicons name="time-outline" size={90} color={MOSTARDA} />
      <Text style={styles.titleSucesso}>Solicitação Enviada!</Text>
      <Text style={styles.textSucesso}>
        Sua solicitação foi encaminhada com sucesso. Por favor, aguarde enquanto o profissional analisa e confirma o seu atendimento.
      </Text>
      
      <TouchableOpacity 
        style={styles.btnVoltar} 
        activeOpacity={0.8}
        onPress={() => router.replace('/cliente/dashboard')}
      >
        <Text style={styles.btnVoltarText}>VOLTAR AO INÍCIO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: CREAM 
  },
  header: { 
    paddingTop: 55, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: WHITE, 
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderColor: BORDER
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginLeft: 12,
    color: PETROLEO 
  },
  content: { 
    padding: 24 
  },
  label: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: PETROLEO,
    marginBottom: 8, 
    marginTop: 18 
  },
  input: { 
    backgroundColor: WHITE, 
    padding: 14, 
    borderRadius: 12, 
    fontSize: 16, 
    color: PETROLEO,
    borderWidth: 1,
    borderColor: BORDER
  },
  pagamentoContainer: { 
    backgroundColor: WHITE, 
    borderRadius: 14, 
    padding: 16, 
    marginTop: 4,
    borderWidth: 1,
    borderColor: BORDER
  },
  radioOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  radioCircle: { 
    height: 22, 
    width: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    borderColor: BORDER, 
    marginRight: 12 
  },
  radioSelected: { 
    backgroundColor: TERRACOTA, 
    borderColor: TERRACOTA 
  },
  radioText: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: PETROLEO 
  },
  revisaoCard: { 
    backgroundColor: WHITE, 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: BORDER
  },
  revisaoText: { 
    fontSize: 16, 
    marginBottom: 12, 
    color: PETROLEO,
    lineHeight: 22
  },
  bold: { 
    fontWeight: '700',
    color: TEXT_MID
  },
  mainButton: { 
    backgroundColor: TERRACOTA, // Novo destaque terracota
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: TERRACOTA,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3
  },
  mainButtonText: { 
    color: WHITE, 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  titleSucesso: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginTop: 20,
    color: PETROLEO 
  },
  textSucesso: { 
    textAlign: 'center', 
    fontSize: 15, 
    lineHeight: 22,
    marginTop: 12, 
    color: TEXT_MID,
    paddingHorizontal: 16
  },
  btnVoltar: { 
    backgroundColor: MOSTARDA, 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 35, 
    width: '100%', 
    alignItems: 'center' 
  },
  btnVoltarText: { 
    color: WHITE, 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5
  }
});