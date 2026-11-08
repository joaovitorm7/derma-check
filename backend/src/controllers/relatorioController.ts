import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { RelatorioModel } from '../models/relatorioModel';

export class RelatorioController {
  // CA01, CA02, CA03, CA05, CA06 (RN01, RN02, RN03, RN04, RN06)
  static async obterRelatorioJSON(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const dados = await RelatorioModel.obterDadosCompletos(usuarioId);

      if (!dados) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const possuiRegistros =
        dados.resumo.total_lesoes > 0 ||
        dados.resumo.total_fotos > 0 ||
        dados.resumo.total_registros_diario > 0;

      // Formata as lesões adicionando indicação para observações pendentes (CA06)
      const lesoesFormatadas = dados.lesoes.map((l) => ({
        ...l,
        observacoes_status: l.observacoes
          ? 'Preenchido'
          : 'Aguardando preenchimento' // CA06
      }));

      return res.status(200).json({
        titulo: 'Relatório DermaCheck', // RN02
        modo_demonstrativo: true, // RN02, CA05
        aviso_legal:
          'ESTE DOCUMENTO É APENAS UMA DEMONSTRAÇÃO VISUAL DO ACOMPANHAMENTO E NÃO REPRESENTA UM RELATÓRIO CLÍNICO REAL.', // RN06, CA05
        informacoes_disponiveis: possuiRegistros, // RN04, CA03
        mensagem_sem_registros: possuiRegistros
          ? null
          : 'Nenhum registro, fotografia ou informação preenchida para compor o relatório.', // RN04, CA03
        usuario: dados.usuario,
        resumo: dados.resumo,
        lesoes: lesoesFormatadas
      });
    } catch (error) {
      console.error('Erro ao gerar resumo do relatório:', error);
      return res.status(500).json({ error: 'Erro interno ao consolidar o relatório.' });
    }
  }

  // RN05 / CA04: Exportar em PDF
  static async exportarPDF(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).usuarioId;
      const dados = await RelatorioModel.obterDadosCompletos(usuarioId);

      if (!dados) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      const doc = new PDFDocument({ margin: 50 });

      // Configurar Headers para download do arquivo PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Relatorio_DermaCheck.pdf"'
      );

      doc.pipe(res);

      // Cabeçalho (RN02)
      doc.fontSize(20).fillColor('#1E3A8A').text('Relatório DermaCheck', { align: 'center' });
      doc.moveDown(0.5);

      // Aviso legal demonstrativo (RN06, CA05)
      doc
        .fontSize(9)
        .fillColor('#DC2626')
        .text(
          '[ MODELO DEMONSTRATIVO - ESTE DOCUMENTO NÃO REPRESENTA UM RELATÓRIO CLÍNICO REAL ]',
          { align: 'center' }
        );
      doc.moveDown(1.5);

      // Dados do Usuário
      doc.fillColor('#000000').fontSize(12).text(`Paciente: ${dados.usuario.nome}`);
      doc.text(`E-mail: ${dados.usuario.email}`);
      doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`);
      doc.moveDown(1);

      // Resumo Geral (RN01)
      doc.fontSize(14).fillColor('#1E3A8A').text('Resumo do Acompanhamento');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#333333');
      doc.text(`- Total de Lesões Registradas: ${dados.resumo.total_lesoes}`);
      doc.text(`- Total de Fotografias Anexadas: ${dados.resumo.total_fotos}`);
      doc.text(`- Registros no Diário da Pele: ${dados.resumo.total_registros_diario}`);
      doc.moveDown(1.5);

      // Detalhamento por Lesão (RN03, CA02, CA03, CA06)
      doc.fontSize(14).fillColor('#1E3A8A').text('Detalhamento das Lesões');
      doc.moveDown(0.5);

      if (dados.lesoes.length === 0) {
        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .text('Informações não disponíveis. Nenhuma lesão foi cadastrada até o momento.'); // RN04, CA03
      } else {
        dados.lesoes.forEach((lesao, index) => {
          doc
            .fontSize(12)
            .fillColor('#111827')
            .text(`${index + 1}. ${lesao.nome_identificacao} (${lesao.localizacao_corpo})`);

          doc
            .fontSize(10)
            .fillColor('#4B5563')
            .text(`   Data do Registro: ${new Date(lesao.data_registro).toLocaleDateString('pt-BR')}`);
          doc.text(`   Quantidade de Fotos: ${lesao.quantidade_fotos}`);
          
          const obsTexto = lesao.observacoes
            ? lesao.observacoes
            : 'Aguardando preenchimento'; // CA06
          doc.text(`   Observações: ${obsTexto}`);
          doc.moveDown(0.8);
        });
      }

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar arquivo PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro interno ao exportar PDF.' });
      }
    }
  }
}