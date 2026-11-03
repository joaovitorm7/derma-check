import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { BookOpen, Clock, House, MessageCircle, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROTAS } from '../constants/rotas';
import { cores } from '../constants/tema';

const COR_INATIVA = '#8293A5';

const ITENS = [
  { titulo: 'Início', Icone: House, destino: ROTAS.inicio },
  { titulo: 'Histórico', Icone: Clock, destino: '/historico' as Href },
  { titulo: 'Diário', Icone: BookOpen, destino: ROTAS.diario },
  { titulo: 'Mensagens', Icone: MessageCircle, destino: '/mensagens' as Href },
  { titulo: 'Perfil', Icone: UserRound, destino: '/perfil' as Href },
];

export function BarraNavegacao({ ativo }: { ativo: 'Início' | 'Diário' }) {
  return (
    <View style={styles.navegacao}>
      {ITENS.map(({ titulo, Icone, destino }) => {
        const selecionado = titulo === ativo;

        return (
          <Pressable
            key={titulo}
            style={styles.item}
            disabled={selecionado}
            onPress={() => router.push(destino)}
            accessibilityRole="button"
            accessibilityLabel={titulo}
            accessibilityState={{ selected: selecionado }}
          >
            <View style={styles.icone}>
              <Icone size={22} color={selecionado ? cores.azulEscuro : COR_INATIVA} />
            </View>
            <Text style={[styles.texto, selecionado && styles.textoAtivo]}>{titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navegacao: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  icone: {
    padding: 2,
  },
  texto: {
    fontSize: 11,
    color: COR_INATIVA,
  },
  textoAtivo: {
    color: cores.azulEscuro,
    fontWeight: '600',
  },
});
