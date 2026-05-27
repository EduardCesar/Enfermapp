import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/api'; 

// ─── PALETA PADRÃO ENFERMAPP ──────────────────────────────────────────────────
const BG_CREAM     = '#F7F5F0';
const PETROLEO     = '#1B4D4D';
const PETROLEO_BG  = '#E0EBEB';
const OLIVA        = '#5C6B2E';
const WHITE        = '#FFFFFF';
const TEXT_DARK    = '#1A1A1A';
const TEXT_MUTED   = '#6B6B6B';
const BORDER       = '#E0DDD6';
const SUCCESS      = '#2E7D32';
const DANGER       = '#C62828';
// ───────────────────────────────────────────────────────────────────────────────

export default function VerificacaoProfissionais() {
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState('menu'); // 'menu', 'lista_docs', 'lista_pagos'
  const [itemSelecionado, setItemSelecionado] = useState(null); 
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode !== 'menu') {
      fetchPendentes();
    }
  }, [viewMode]);

  const fetchPendentes = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profissional').select(`
        id_profissional, id_usuario, coren_url, comprovante_url, status_aprovacao, status_pagamento,
        usuario:id_usuario ( nome_usuario )
      `);

      if (viewMode === 'lista_docs') {
        query = query.eq('status_aprovacao', 'pendente').not('coren_url', 'is', null);
      } else if (viewMode === 'lista_pagos') {
        query = query.eq('status_pagamento', 'pendente').not('comprovante_url', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLista(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const julgarStatus = async (status) => {
    try {
      const colunaParaAtualizar = viewMode === 'lista_docs' ? 'status_aprovacao' : 'status_pagamento';
      
      const objetoUpdate = {};
      objetoUpdate[colunaParaAtualizar] = status;

      const { error } = await supabase
        .from('profissional')
        .update(objetoUpdate)
        .eq('id_profissional', itemSelecionado.id_profissional);

      if (error) throw error;

      Alert.alert("Sucesso", `${viewMode === 'lista_docs' ? 'Documento' : 'Pagamento'} foi ${status}!`);
      setItemSelecionado(null);
      fetchPendentes();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  // ─── RENDER 1: DETALHE DA ANÁLISE (FOTO + AÇÕES) ───────────────────────────
  if (itemSelecionado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBackButton} onPress={() => setItemSelecionado(null)}>
            <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {itemSelecionado.usuario?.nome_usuario}
          </Text>
        </View>
        
        <View style={styles.detailContent}>
          <Text style={styles.detailSub}>
            Análise de {viewMode === 'lista_docs' ? 'Documento COREN' : 'Comprovante PIX'}
          </Text>
          
          <View style={styles.imageFrame}>
            <Image 
              source={{ uri: viewMode === 'lista_docs' ? itemSelecionado.coren_url : itemSelecionado.comprovante_url }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.rowActions}>
            {/* Botão Rejeitar */}
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionBtn, { backgroundColor: DANGER }]} 
              onPress={() => julgarStatus('rejeitado')}
            >
              <Ionicons name="close-outline" size={32} color={WHITE} />
            </TouchableOpacity>

            {/* Botão Aprovar */}
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.actionBtn, { backgroundColor: SUCCESS }]} 
              onPress={() => julgarStatus('aprovado')}
            >
              <Ionicons name="checkmark-outline" size={32} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── RENDER 2: LISTA DE PENDÊNCIAS ─────────────────────────────────────────
  if (viewMode !== 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBackButton} onPress={() => setViewMode('menu')}>
            <Ionicons name="chevron-back" size={26} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {viewMode === 'lista_docs' ? 'Documentos' : 'Pagamentos'}
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={PETROLEO} />
          </View>
        ) : (
          <FlatList
            data={lista}
            keyExtractor={item => String(item.id_profissional)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={styles.nameCard} 
                onPress={() => setItemSelecionado(item)}
              >
                <Text style={styles.nameText}>{item.usuario?.nome_usuario}</Text>
                <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="check-circle" size={48} color={OLIVA} />
                <Text style={styles.emptyText}>Nenhuma pendência por aqui.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ─── RENDER 3: MENU INICIAL (BOTÕES ESTILO PÍLULA) ─────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButtonMenu} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={TEXT_DARK} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>Verificação</Text>
          <Text style={styles.titleAccent}>de profissionais</Text>
          <Text style={styles.subtitle}>Selecione uma das opções abaixo:</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Botão Documentos (Estilo Pílula Petróleo) */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={[styles.pillButton, styles.buttonPetroleo]} 
            onPress={() => setViewMode('lista_docs')}
          >
            <Ionicons name="document-text-outline" size={20} color={WHITE} style={{ marginRight: 10 }} />
            <Text style={styles.pillButtonText}>DOCUMENTOS PENDENTES</Text>
          </TouchableOpacity>

          {/* Botão Pagamento (Estilo Pílula Oliva) */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={[styles.pillButton, styles.buttonOliva]} 
            onPress={() => setViewMode('lista_pagos')}
          >
            <Ionicons name="card-outline" size={20} color={WHITE} style={{ marginRight: 10 }} />
            <Text style={styles.pillButtonText}>PAGAMENTOS PENDENTES</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG_CREAM, 
  },
  // Estrutura de Header para sub-telas
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  iconBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginLeft: 8,
    flex: 1,
  },
  backButtonMenu: { 
    padding: 16, 
    alignSelf: 'flex-start' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  headerTextSection: {
    marginBottom: 40,
    alignItems: 'center',
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
    color: PETROLEO,
    letterSpacing: -0.5,
    marginTop: -4,
  },
  subtitle: { 
    fontSize: 15, 
    color: TEXT_MUTED, 
    marginTop: 16,
    fontWeight: '500',
  },
  // Botões no padrão Pílula
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  pillButton: { 
    width: '100%', 
    height: 60, 
    borderRadius: 30, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonPetroleo: { backgroundColor: PETROLEO },
  buttonOliva: { backgroundColor: OLIVA },
  pillButtonText: { 
    color: WHITE, 
    fontSize: 14, 
    fontWeight: '700',
    letterSpacing: 1.2 
  },
  // Lista de Cards Estilizada
  listContent: {
    padding: 20,
  },
  nameCard: { 
    backgroundColor: WHITE, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderRadius: 14, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  nameText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: TEXT_DARK 
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: { 
    fontSize: 16,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  // Tela de Análise de Imagem Interna
  detailContent: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 24,
    justifyContent: 'space-between'
  },
  detailSub: { 
    fontSize: 16, 
    color: TEXT_MUTED, 
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageFrame: {
    flex: 1,
    width: '100%',
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden', // Evita qualquer vazamento nos cantos
    padding: 8,
  },
  fullImage: { 
    width: '100%', 
    height: '100%', 
  },
  rowActions: { 
    flexDirection: 'row', 
    gap: 32, 
    marginVertical: 24,
  },
  actionBtn: { 
    width: 68, 
    height: 68, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  }
});