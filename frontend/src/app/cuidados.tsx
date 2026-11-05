
import { router } from 'expo-router';
import {
    Asterisk,
    ChevronLeft,
    CloudSun,
    Eye,
    Settings,
    Shield,
    Sun
} from 'lucide-react-native';
import React from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { BarraNavegacao } from '../components/barra-navegacao';

const AZUL = '#2463A6';
const AZUL_CLARO = '#EAF3FC';
const FUNDO = '#F0F8FF';
const TEXTO = '#315675';

type CuidadoProps = {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  orientacao: string;
};

function CuidadoCard({
  titulo,
  descricao,
  icone,
}: CuidadoProps) {
  return (
    <View style={styles.cuidadoCard}>
      <View style={styles.cuidadoIcone}>
        {icone}
      </View>

      <View style={styles.cuidadoTextos}>
        <Text style={styles.cuidadoTitulo}>{titulo}</Text>
        <Text style={styles.cuidadoDescricao}>{descricao}</Text>
      </View>
    </View>
  );
}

type CriterioProps = {
  letra: string;
  titulo: string;
  descricao: string;
};

function CriterioABCDE({
  letra,
  titulo,
  descricao,
}: CriterioProps) {
  return (
    <View style={styles.criterioCard}>
      <View style={styles.letraCirculo}>
        <Text style={styles.letra}>{letra}</Text>
      </View>

      <View style={styles.criterioTextos}>
        <Text style={styles.criterioTitulo}>{titulo}</Text>
        <Text style={styles.criterioDescricao}>{descricao}</Text>
      </View>
    </View>
  );
}

export default function Cuidados() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <Pressable
            style={styles.botaoVoltar}
            onPress={() => router.replace('/inicio' as never)}
            accessibilityLabel="Voltar para o início"
        >
        <ChevronLeft size={27} color={AZUL} />
        </Pressable>

        <Text style={styles.tituloCabecalho}>
          Cuidados com a pele
        </Text>

        <Pressable
          style={styles.botaoConfiguracoes}
          onPress={() => router.push('/configuracoes' as never)}
          accessibilityLabel="Configurações"
        >
          <Settings size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Apresentação */}
        <View style={styles.banner}>
          <Sun size={32} color={AZUL} />

          <Text style={styles.bannerTitulo}>
            Proteja sua pele
          </Text>

          <Text style={styles.bannerDescricao}>
            A prevenção e a observação são parte dos cuidados com a saúde da pele.
          </Text>
        </View>

        {/* Cuidados diários */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>
            Cuidados diários
          </Text>

          <View style={styles.listaCuidados}>
            <CuidadoCard
              titulo="Use protetor solar"
              descricao="Escolha um produto adequado e reaplique conforme as instruções."
              icone={<Shield size={23} color={AZUL} />}
              orientacao={
                'Utilize protetor solar de amplo espectro, com FPS 30 ou superior. Aplique nas áreas expostas antes de sair ao sol e reaplique aproximadamente a cada duas horas, ou após nadar, suar intensamente ou se secar com toalha. Siga também as instruções da embalagem.'
              }
            />

            <CuidadoCard
              titulo="Busque sombra e proteção"
              descricao="Use roupas protetoras, chapéu e óculos de sol."
              icone={<CloudSun size={23} color={AZUL} />}
              orientacao={
                'Procure permanecer na sombra, especialmente nos horários de maior intensidade da radiação solar. Utilize roupas que protejam a pele, chapéus de abas largas e óculos de sol com proteção UV. Lembre-se de que a sombra não elimina completamente a exposição à radiação ultravioleta.'
              }
            />

            <CuidadoCard
              titulo="Observe mudanças"
              descricao="Preste atenção em alterações de tamanho, forma, cor ou sintomas."
              icone={<Eye size={23} color={AZUL} />}
              orientacao={
                'Observe regularmente suas pintas e manchas. Fique atento a alterações no tamanho, formato, bordas e cores, além de sintomas como coceira, dor, sangramento ou feridas que não cicatrizam. Se perceber alguma mudança, procure avaliação de um profissional de saúde.'
              }
            />
          </View>
        </View>

        {/* Regra do ABCDE */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>
            Regra do ABCDE
          </Text>

          <View style={styles.listaCriterios}>
            <CriterioABCDE
              letra="A"
              titulo="Assimetria"
              descricao="Uma metade da lesão é diferente da outra."
            />

            <CriterioABCDE
              letra="B"
              titulo="Bordas"
              descricao="Irregulares, recortadas ou mal definidas."
            />

            <CriterioABCDE
              letra="C"
              titulo="Cor"
              descricao="Várias cores ou tonalidades na mesma lesão."
            />

            <CriterioABCDE
              letra="D"
              titulo="Diâmetro"
              descricao="Maior que cerca de 6 mm, embora lesões menores também mereçam atenção."
            />

            <CriterioABCDE
              letra="E"
              titulo="Evolução"
              descricao="Mudança de tamanho, forma, cor ou sintomas."
            />
          </View>
        </View>

        {/* Aviso de avaliação */}
        <View style={styles.aviso}>
          <View style={styles.avisoCabecalho}>
            <Asterisk size={21} color="#94601D" />
            <Text style={styles.avisoTitulo}>
              Quando procurar avaliação?
            </Text>
          </View>

          <Text style={styles.avisoDescricao}>
            Lesões que mudam, sangram, coçam persistentemente, causam dor
            ou não cicatrizam precisam de avaliação profissional.
          </Text>
        </View>

        {/* Informação adicional */}
        <Text style={styles.rodape}>
          O DermaCheck é uma ferramenta de acompanhamento e prevenção.
          A regra do ABCDE ajuda a identificar sinais de atenção, mas não
          substitui uma avaliação dermatológica.
        </Text>
      </ScrollView>

      {/* Navegação inferior */}
      <BarraNavegacao ativo="Início" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: FUNDO,
    borderBottomWidth: 1,
    borderBottomColor: '#DCEAF8',
  },
  botaoVoltar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E3F0FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCabecalho: {
    fontSize: 17,
    fontWeight: '700',
    color: AZUL,
  },
  botaoConfiguracoes: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#039BE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#81C8F7',
    elevation: 4,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 26,
  },
  banner: {
    backgroundColor: '#DCEEFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#C4E1FF',
    padding: 20,
    gap: 7,
    elevation: 2,
  },
  bannerTitulo: {
    fontSize: 23,
    fontWeight: '700',
    color: AZUL,
  },
  bannerDescricao: {
    fontSize: 14,
    color: '#536D84',
    lineHeight: 21,
  },
  secao: {
    gap: 12,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: '700',
    color: AZUL,
  },
  listaCuidados: {
    gap: 13,
  },
  cuidadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D8E7F5',
    gap: 12,
    minHeight: 94,
    elevation: 1,
  },
  cuidadoIcone: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: '#E9F3FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuidadoTextos: {
    flex: 1,
    gap: 4,
  },
  cuidadoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXTO,
  },
  cuidadoDescricao: {
    fontSize: 13,
    color: '#58718B',
    lineHeight: 19,
  },
  pressionado: {
    opacity: 0.75,
  },
  listaCriterios: {
    gap: 11,
  },
  criterioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E7F5',
    gap: 13,
    minHeight: 73,
    elevation: 1,
  },
  letraCirculo: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#DDEEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: {
    fontSize: 20,
    fontWeight: '700',
    color: AZUL,
  },
  criterioTextos: {
    flex: 1,
    gap: 3,
  },
  criterioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXTO,
  },
  criterioDescricao: {
    fontSize: 13,
    color: '#58718B',
    lineHeight: 19,
  },
  aviso: {
    backgroundColor: '#FFF6E8',
    borderWidth: 1,
    borderColor: '#FFDBA8',
    borderRadius: 19,
    padding: 17,
    gap: 8,
  },
  avisoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avisoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#80551F',
  },
  avisoDescricao: {
    fontSize: 13,
    color: '#806344',
    lineHeight: 20,
  },
  rodape: {
    fontSize: 12,
    color: '#71869A',
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
