
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, FileText, RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { obterToken } from '../services/authService';

interface LesaoRelatorio {
  lesao_id?: number;
  nome_identificacao?: string;
  identificacao?: string;
  localizacao_corpo?: string;
  data_registro?: string;
  quantidade_fotos?: number;
  total_fotos_registradas?: number;
  observacoes?: string;
  observacoes_status?: string;
}

interface Relatorio {
  titulo?: string;
  modo_demonstrativo?: boolean;
  aviso_legal?: string;
  mensagem_sem_registros?: string | null;
  informacoes_disponiveis?: boolean;
  usuario?: {
    nome?: string;
    email?: string;
  };
  resumo?: {
    total_lesoes?: number;
    total_fotos?: number;
    total_registros_diario?: number;
  };
  lesoes?: LesaoRelatorio[];
}

export default function Relatorios() {
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarRelatorio = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const token = await obterToken();

      if (!token) {
        setErro('Sua sessão expirou. Faça login novamente.');
        return;
      }

      const resposta = await api.get('/api/relatorios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRelatorio(resposta.data);
    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error);

      if (error.response?.status === 401) {
        setErro('Sua sessão expirou. Faça login novamente.');
      } else if (error.response?.status === 404) {
        setErro('O serviço de relatórios não foi encontrado no servidor.');
      } else {
        setErro(
          error.response?.data?.message ||
          'Não foi possível carregar os relatórios. Verifique sua conexão e tente novamente.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  const lesoes = relatorio?.lesoes || [];

  const totalLesoes =
    relatorio?.resumo?.total_lesoes ?? lesoes.length;

  const totalFotos =
    relatorio?.resumo?.total_fotos ??
    lesoes.reduce(
      (total, lesao) =>
        total +
        (lesao.quantidade_fotos ??
          lesao.total_fotos_registradas ??
          0),
      0
    );

  const totalDiarios =
    relatorio?.resumo?.total_registros_diario ?? 0;

  const escaparHTML = (texto: string) => {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatarData = (data?: string) => {
    if (!data) return 'Não informada';

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return data;
    }

    return dataFormatada.toLocaleDateString('pt-BR');
  };

  const exportarPDF = async () => {
    if (!relatorio) {
      Alert.alert('Atenção', 'Carregue os dados antes de exportar o relatório.');
      return;
    }

    try {
      setExportando(true);

      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const nomeUsuario = relatorio.usuario?.nome || 'Usuário DermaCheck';

      const listaLesoes = lesoes.length > 0
        ? lesoes.map((lesao, index) => `
          <div class="lesao">
            <h3>Lesão ${index + 1}: ${escaparHTML(
              lesao.nome_identificacao ||
              lesao.identificacao ||
              'Sem identificação'
            )}</h3>
            <p><strong>Localização:</strong> ${escaparHTML(
              lesao.localizacao_corpo || 'Não informada'
            )}</p>
            <p><strong>Data do registro:</strong> ${escaparHTML(
              formatarData(lesao.data_registro)
            )}</p>
            <p><strong>Fotografias:</strong> ${
              lesao.quantidade_fotos ??
              lesao.total_fotos_registradas ??
              0
            }</p>
            <p><strong>Observações:</strong> ${escaparHTML(
              lesao.observacoes || 'Nenhuma observação registrada'
            )}</p>
            <p><strong>Status:</strong> ${escaparHTML(
              lesao.observacoes_status || 'Sem informações adicionais'
            )}</p>
          </div>
        `).join('')
        : '<p>Nenhuma lesão registrada até o momento.</p>';

      const aviso =
        relatorio.aviso_legal ||
        'Este relatório apresenta informações de acompanhamento e não substitui uma avaliação médica profissional.';

      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 35px;
              color: #34516f;
            }
            .cabecalho {
              border-bottom: 2px solid #d5e7f8;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            h1 { color: #2868ad; font-size: 26px; }
            h2 { color: #315779; font-size: 18px; }
            h3 { color: #2868ad; font-size: 16px; }
            p { font-size: 13px; line-height: 1.6; }
            .subtitulo { color: #71859a; font-size: 13px; }
            .resumo, .lesao {
              padding: 15px;
              margin-bottom: 15px;
              border: 1px solid #d5e6f8;
              border-radius: 8px;
            }
            .aviso {
              margin-top: 30px;
              padding: 18px;
              background: #eff7ff;
              border-radius: 8px;
              text-align: center;
              font-size: 12px;
              line-height: 1.6;
            }
            .data {
              margin-top: 25px;
              font-size: 11px;
              color: #8194a8;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <h1>Relatório DermaCheck</h1>
            <div class="subtitulo">
              Acompanhamento de ${escaparHTML(nomeUsuario)}
            </div>
          </div>

          <h2>Resumo do acompanhamento</h2>
          <div class="resumo">
            <p><strong>Total de lesões:</strong> ${totalLesoes}</p>
            <p><strong>Total de fotografias:</strong> ${totalFotos}</p>
            <p><strong>Registros de diário:</strong> ${totalDiarios}</p>
          </div>

          <h2>Lesões registradas</h2>
          ${listaLesoes}

          <div class="aviso">
            ${escaparHTML(aviso)}
          </div>

          <div class="data">
            Relatório gerado em ${dataAtual}
          </div>
        </body>
        </html>
      `;

      const arquivo = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const compartilhamentoDisponivel =
        await Sharing.isAvailableAsync();

      if (compartilhamentoDisponivel) {
        await Sharing.shareAsync(arquivo.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Relatório DermaCheck',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          'PDF gerado',
          'O arquivo foi gerado, mas o compartilhamento não está disponível neste dispositivo.'
        );
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);

      Alert.alert(
        'Erro',
        'Não foi possível gerar o relatório em PDF. Tente novamente.'
      );
    } finally {
      setExportando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabecalho}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/inicio');
              }
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={27} color="#2468AD" />
          </TouchableOpacity>

          <Text style={styles.tituloCabecalho}>Relatórios</Text>

          <TouchableOpacity
            style={styles.botaoConfiguracoes}
            onPress={carregarRelatorio}
            activeOpacity={0.8}
          >
            <RefreshCw size={23} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="large" color="#2868AD" />
            <Text style={styles.textoEstado}>
              Carregando seus relatórios...
            </Text>
          </View>
        ) : erro ? (
          <View style={styles.estado}>
            <FileText size={45} color="#75B8F5" />
            <Text style={styles.tituloEstado}>
              Não foi possível carregar
            </Text>
            <Text style={styles.textoEstado}>{erro}</Text>

            <TouchableOpacity
              style={styles.botaoTentarNovamente}
              onPress={carregarRelatorio}
            >
              <Text style={styles.textoBotaoExportar}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartaoRelatorio}>
              <View style={styles.iconeDocumento}>
                <FileText size={35} color="#286DB5" strokeWidth={1.6} />
              </View>

              <Text style={styles.tituloRelatorio}>
                Relatório DermaCheck
              </Text>

              <Text style={styles.subtituloRelatorio}>
                Resumo do seu acompanhamento
              </Text>

              <View style={styles.divisor} />

              <Text style={styles.tituloResumo}>
                Resumo do acompanhamento
              </Text>

              <View style={styles.gradeResumo}>
                <View style={styles.itemResumo}>
                  <Text style={styles.numeroResumo}>{totalLesoes}</Text>
                  <Text style={styles.rotuloResumo}>Lesões</Text>
                </View>

                <View style={styles.itemResumo}>
                  <Text style={styles.numeroResumo}>{totalFotos}</Text>
                  <Text style={styles.rotuloResumo}>Fotografias</Text>
                </View>

                <View style={styles.itemResumo}>
                  <Text style={styles.numeroResumo}>{totalDiarios}</Text>
                  <Text style={styles.rotuloResumo}>Diários</Text>
                </View>
              </View>

              <View style={styles.divisor} />

              <Text style={styles.tituloResumo}>
                Lesões registradas
              </Text>

              {lesoes.length === 0 ? (
                <Text style={styles.textoInformacao}>
                  {relatorio?.mensagem_sem_registros ||
                    'Você ainda não possui lesões registradas.'}
                </Text>
              ) : (
                lesoes.map((lesao, index) => (
                  <View
                    key={lesao.lesao_id ?? index}
                    style={styles.cartaoLesao}
                  >
                    <Text style={styles.nomeLesao}>
                      {lesao.nome_identificacao ||
                        lesao.identificacao ||
                        `Lesão ${index + 1}`}
                    </Text>

                    <Text style={styles.textoInformacao}>
                      Localização: {lesao.localizacao_corpo || 'Não informada'}
                    </Text>

                    <Text style={styles.textoInformacao}>
                      Data: {formatarData(lesao.data_registro)}
                    </Text>

                    <Text style={styles.textoInformacao}>
                      Fotografias: {lesao.quantidade_fotos ??
                        lesao.total_fotos_registradas ?? 0}
                    </Text>

                    {!!lesao.observacoes && (
                      <Text style={styles.textoInformacao}>
                        Observações: {lesao.observacoes}
                      </Text>
                    )}

                    {!!lesao.observacoes_status && (
                      <Text style={styles.textoStatus}>
                        {lesao.observacoes_status}
                      </Text>
                    )}
                  </View>
                ))
              )}

              <View style={styles.divisor} />

              <Text style={styles.aviso}>
                {relatorio?.aviso_legal ||
                  'Este relatório apresenta informações de acompanhamento e não substitui uma avaliação médica profissional.'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.botaoExportar,
                exportando && styles.botaoDesabilitado,
              ]}
              onPress={exportarPDF}
              disabled={exportando}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoExportar}>
                {exportando ? 'Gerando PDF...' : 'Exportar relatório em PDF'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8FE',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  cabecalho: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 13,
  },
  botaoVoltar: {
    width: 46,
    height: 46,
    backgroundColor: '#E6F2FF',
    borderWidth: 1,
    borderColor: '#C4E1FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloCabecalho: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2868AD',
  },
  botaoConfiguracoes: {
    width: 53,
    height: 53,
    borderRadius: 27,
    backgroundColor: '#0798F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A9D9FF',
    elevation: 4,
    shadowColor: '#2468AD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
  },
  cartaoRelatorio: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 13,
    paddingHorizontal: 23,
    paddingTop: 25,
    paddingBottom: 24,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#C9E3FF',
    elevation: 2,
    shadowColor: '#4385C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  iconeDocumento: {
    width: 41,
    height: 41,
    backgroundColor: '#EDF6FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  tituloRelatorio: {
    fontSize: 27,
    fontWeight: '700',
    color: '#2868AD',
    letterSpacing: -0.7,
  },
  subtituloRelatorio: {
    fontSize: 14,
    color: '#607891',
    marginTop: 5,
  },
  divisor: {
    height: 1,
    backgroundColor: '#D5E6F8',
    marginVertical: 19,
  },
  tituloResumo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#315779',
    marginBottom: 15,
  },
  gradeResumo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  itemResumo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EDF6FF',
    paddingVertical: 15,
    borderRadius: 13,
  },
  numeroResumo: {
    fontSize: 25,
    fontWeight: '700',
    color: '#2868AD',
  },
  rotuloResumo: {
    fontSize: 12,
    color: '#607891',
    marginTop: 4,
  },
  cartaoLesao: {
    backgroundColor: '#F5FAFF',
    borderWidth: 1,
    borderColor: '#D5E6F8',
    borderRadius: 13,
    padding: 14,
    marginBottom: 12,
    gap: 7,
  },
  nomeLesao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2868AD',
    marginBottom: 3,
  },
  textoInformacao: {
    fontSize: 13,
    color: '#607891',
    lineHeight: 20,
  },
  textoStatus: {
    fontSize: 12,
    color: '#2868AD',
    lineHeight: 18,
    marginTop: 3,
  },
  aviso: {
    fontSize: 12,
    color: '#607891',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 2,
    marginTop: 5,
  },
  botaoExportar: {
    height: 54,
    backgroundColor: '#2868AD',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2868AD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotaoExportar: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 70,
    gap: 14,
  },
  tituloEstado: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2868AD',
    textAlign: 'center',
  },
  textoEstado: {
    fontSize: 14,
    color: '#607891',
    textAlign: 'center',
    lineHeight: 21,
  },
  botaoTentarNovamente: {
    backgroundColor: '#2868AD',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 13,
    marginTop: 8,
  },
});
