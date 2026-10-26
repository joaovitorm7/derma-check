
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
        styles.atalho,
        pressed && styles.pressionado,
      ]}
      onPress={() => router.push(destino as never)}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
    >
      <View style={styles.iconeAtalho}>{icone}</View>

      <View style={styles.textoAtalho}>
        <Text style={styles.tituloAtalho}>{titulo}</Text>
        <Text style={styles.descricaoAtalho}>{descricao}</Text>
      </View>

      <ChevronRight size={21} color="#7890A8" />
    </Pressable>
  );
}

export default function Inicio() {
  // Substitua pelo nome do usuário autenticado, quando disponível.
  const nomeUsuario = 'Olá';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.boasVindas}>
          <Text style={styles.ola}>{nomeUsuario}, seja bem-vindo(a)!</Text>
          <Text style={styles.textoBoasVindas}>
            Cuidar da pele também é prestar atenção às pequenas mudanças.
          </Text>

          <View style={styles.destaqueIcone}>
            <ShieldCheck size={34} color="#FFFFFF" />
          </View>
        </View>

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

        <View style={styles.aviso}>
          <ShieldCheck size={23} color={AZUL} />

          <View style={styles.avisoTexto}>
            <Text style={styles.avisoTitulo}>Importante</Text>
            <Text style={styles.avisoDescricao}>
              O DermaCheck ajuda a organizar informações e acompanhar
              mudanças na pele, mas não substitui a avaliação de um
              profissional de saúde.
            </Text>
          </View>
        </View>
      </ScrollView>

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
          { color: ativo ? AZUL : '#8293A5' },
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  marca: {
    fontSize: 25,
    fontWeight: '800',
    color: TEXTO,
  },
  marcaAzul: {
    color: AZUL,
  },
  subtituloMarca: {
    fontSize: 12,
    color: '#71849A',
    marginTop: 3,
  },
  acoesCabecalho: {
    flexDirection: 'row',
    gap: 9,
  },
  botaoIcone: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2EBF5',
  },
  boasVindas: {
    backgroundColor: AZUL_CLARO,
    borderRadius: 22,
    padding: 21,
    marginBottom: 18,
    overflow: 'hidden',
  },
  ola: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXTO,
    maxWidth: '90%',
  },
  textoBoasVindas: {
    color: '#4E6882',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    maxWidth: '90%',
  },
  destaqueIcone: {
    position: 'absolute',
    right: -8,
    bottom: -12,
    width: 78,
    height: 78,
    borderRadius: 40,
    backgroundColor: '#8DBBE7',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  botaoPrincipal: {
    backgroundColor: AZUL,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
  },
  maisIcone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipalTexto: {
    flex: 1,
    marginLeft: 13,
  },
  botaoPrincipalTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  botaoPrincipalDescricao: {
    fontSize: 12,
    color: '#E2EEFC',
    marginTop: 4,
  },
  tituloSecao: {
    color: TEXTO,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  listaAtalhos: {
    gap: 10,
  },
  atalho: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDF6',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressionado: {
    opacity: 0.75,
  },
  iconeAtalho: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAtalho: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },
  tituloAtalho: {
    color: TEXTO,
    fontSize: 15,
    fontWeight: '700',
  },
  descricaoAtalho: {
    color: '#71849A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  aviso: {
    backgroundColor: '#EAF3FC',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginTop: 22,
  },
  avisoTexto: {
    flex: 1,
  },
  avisoTitulo: {
    color: TEXTO,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  avisoDescricao: {
    color: '#4E6882',
    fontSize: 12,
    lineHeight: 19,
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4ECF5',
    paddingTop: 10,
    paddingBottom: 8,
  },
  itemNavegacao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconeAtivo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeInativo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNavegacao: {
    fontSize: 10,
    color: '#8293A5',
  },
  textoAtivo: {
    color: AZUL,
    fontWeight: '800',
  },
});
