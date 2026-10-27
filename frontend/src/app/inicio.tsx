import { router } from 'expo-router';
import {
  Bell,
  BookOpen,
  Camera,
  ChevronRight,
  Clock,
  House,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const AZUL = '#2463A6';
const AZUL_CLARO = '#EAF3FC';
const FUNDO = '#F5F9FE';
const TEXTO = '#18324F';

type AtalhoProps = {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  destino: string;
};

function Atalho({ titulo, descricao, icone, destino }: AtalhoProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.atalhoCard,
        pressed && styles.pressionado,
      ]}
      onPress={() => router.push(destino as never)}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={styles.atalhoIconeContainer}>{icone}</View>
      <View style={styles.atalhoTextos}>
        <Text style={styles.atalhoTitulo}>{titulo}</Text>
        <Text style={styles.atalhoDescricao}>{descricao}</Text>
      </View>
      <ChevronRight size={21} color="#7890A8" />
    </Pressable>
  );
}

export default function Inicio() {
  const nomeUsuario = 'Olá';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.marca}>
              Derma<Text style={styles.marcaAzul}>Check</Text>
            </Text>
            <Text style={styles.subtituloMarca}>
              Acompanhe sua pele com cuidado
            </Text>
          </View>

          <View style={styles.acoesCabecalho}>
            <Pressable
              style={styles.botaoIcone}
              onPress={() => router.push('/configuracoes' as never)}
              accessibilityLabel="Configurações"
            >
              <Settings size={21} color={AZUL} />
            </Pressable>

            <Pressable
              style={styles.botaoIcone}
              onPress={() => router.push('/perfil' as never)}
              accessibilityLabel="Meu perfil"
            >
              <UserRound size={21} color={AZUL} />
            </Pressable>
          </View>
        </View>

        {/* Card de Boas-Vindas */}
        <View style={styles.boasVindas}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ola}>{nomeUsuario}, seja bem-vindo(a)!</Text>
            <Text style={styles.textoBoasVindas}>
              Cuidar da pele também é prestar atenção às pequenas mudanças.
            </Text>
          </View>
          <View style={styles.destaqueIcone}>
            <ShieldCheck size={34} color="#FFFFFF" />
          </View>
        </View>

        {/* Botão de Ação Principal */}
        <Pressable
          style={({ pressed }) => [
            styles.botaoPrincipal,
            pressed && styles.pressionado,
          ]}
          onPress={() => router.push('/nova-lesao' as never)}
          accessibilityRole="button"
        >
          <View style={styles.maisIcone}>
            <Plus size={24} color={AZUL} />
          </View>

          <View style={styles.botaoPrincipalTexto}>
            <Text style={styles.botaoPrincipalTitulo}>+ Nova lesão</Text>
            <Text style={styles.botaoPrincipalDescricao}>
              Registre uma pinta ou mancha
            </Text>
          </View>

          <ChevronRight size={23} color="#FFFFFF" />
        </Pressable>

        {/* Lista de Atalhos */}
        <Text style={styles.tituloSecao}>O que você deseja fazer?</Text>

        <View style={styles.listaAtalhos}>
          <Atalho
            titulo="Registrar lesão"
            descricao="Adicione fotos e observações"
            icone={<Camera size={23} color={AZUL} />}
            destino="/nova-lesao"
          />

          <Atalho
            titulo="Meu histórico"
            descricao="Consulte seus registros anteriores"
            icone={<Clock size={23} color={AZUL} />}
            destino="/historico"
          />

          <Atalho
            titulo="Diário da pele"
            descricao="Registre sintomas e exposição solar"
            icone={<BookOpen size={23} color={AZUL} />}
            destino="/diario"
          />

          <Atalho
            titulo="Lembretes"
            descricao="Organize fotos e consultas de retorno"
            icone={<Bell size={23} color={AZUL} />}
            destino="/lembretes"
          />

          <Atalho
            titulo="Cuidados e prevenção"
            descricao="Veja dicas para cuidar da sua pele"
            icone={<Sun size={23} color={AZUL} />}
            destino="/cuidados"
          />
        </View>

        {/* Aviso de Isenção de Responsabilidade */}
        <View style={styles.aviso}>
          <ShieldCheck size={23} color={AZUL} />
          <View style={styles.avisoTexto}>
            <Text style={styles.avisoTitulo}>Importante</Text>
            <Text style={styles.avisoDescricao}>
              O DermaCheck ajuda a organizar informações e acompanhar mudanças na pele, mas não substitui a avaliação de um profissional de saúde.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <View style={styles.navegacao}>
        <ItemNavegacao
          titulo="Início"
          icone={<House size={22} />}
          ativo
          destino="/"
        />
        <ItemNavegacao
          titulo="Histórico"
          icone={<Clock size={22} />}
          destino="/historico"
        />
        <ItemNavegacao
          titulo="Diário"
          icone={<BookOpen size={22} />}
          destino="/diario"
        />
        <ItemNavegacao
          titulo="Mensagens"
          icone={<MessageCircle size={22} />}
          destino="/mensagens"
        />
        <ItemNavegacao
          titulo="Perfil"
          icone={<UserRound size={22} />}
          destino="/perfil"
        />
      </View>
    </SafeAreaView>
  );
}

type ItemNavegacaoProps = {
  titulo: string;
  icone: React.ReactNode;
  destino: string;
  ativo?: boolean;
};

function ItemNavegacao({
  titulo,
  icone,
  destino,
  ativo = false,
}: ItemNavegacaoProps) {
  return (
    <Pressable
      style={styles.itemNavegacao}
      onPress={() => router.push(destino as never)}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ selected: ativo }}
    >
      <View style={ativo ? styles.iconeAtivo : styles.iconeInativo}>
        {React.cloneElement(
          icone as React.ReactElement<{ color?: string }>,
          { color: ativo ? AZUL : '#8293A5' }
        )}
      </View>

      <Text style={[styles.textoNavegacao, ativo && styles.textoAtivo]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 18,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marca: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXTO,
  },
  marcaAzul: {
    color: AZUL,
  },
  subtituloMarca: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  acoesCabecalho: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boasVindas: {
    flexDirection: 'row',
    backgroundColor: AZUL_CLARO,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  ola: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXTO,
  },
  textoBoasVindas: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  destaqueIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AZUL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipal: {
    flexDirection: 'row',
    backgroundColor: AZUL,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  maisIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipalTexto: {
    flex: 1,
  },
  botaoPrincipalTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botaoPrincipalDescricao: {
    fontSize: 12,
    color: '#E0F2FE',
    marginTop: 2,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXTO,
    marginTop: 6,
  },
  listaAtalhos: {
    gap: 10,
  },
  atalhoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  atalhoIconeContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhoTextos: {
    flex: 1,
  },
  atalhoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXTO,
  },
  atalhoDescricao: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  pressionado: {
    opacity: 0.8,
  },
  aviso: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'flex-start',
  },
  avisoTexto: {
    flex: 1,
  },
  avisoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXTO,
  },
  avisoDescricao: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  navegacao: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  itemNavegacao: {
    alignItems: 'center',
    gap: 4,
  },
  iconeAtivo: {
    padding: 2,
  },
  iconeInativo: {
    padding: 2,
  },
  textoNavegacao: {
    fontSize: 11,
    color: '#8293A5',
  },
  textoAtivo: {
    color: AZUL,
    fontWeight: '600',
  },
});