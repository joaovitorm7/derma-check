import bcrypt from 'bcrypt';
import { pool } from '../config/database';

async function criarUsuariosEDataTeste() {
  try {
    console.log('⏳ Gerando hash das senhas de teste...');
    const senhaPadrao = 'Senha123';
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);

    // 1. Usuário Paciente (CLIENTE)
    const [pacienteResult]: any = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`,
      ['Paciente de Teste', 'paciente.teste@dermacheck.com', senhaHash, 'CLIENTE', true]
    );
    const pacienteId = pacienteResult.insertId;

    // 2. Usuário Profissional (PROFISSIONAL)
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo_usuario, crm, especialidade, telefone, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nome=VALUES(nome);`,
      ['Dr. Carlos Dermatologista', 'medico.teste@dermacheck.com', senhaHash, 'PROFISSIONAL', '123456/CE', 'Dermatologia', '88999998888', true]
    );

    // 3. Lesão de Exemplo para o Paciente (RN01, RN06)
    if (pacienteId) {
      const [lesoesExistentes]: any = await pool.query(
        `SELECT id FROM lesoes WHERE usuario_id = ? AND nome_identificacao = ?`,
        [pacienteId, 'Pinta no Antebraço Esquerdo']
      );

      let lesaoId = lesoesExistentes.length > 0 ? lesoesExistentes[0].id : null;

      if (!lesaoId) {
        const [lesaoResult]: any = await pool.query(
          `INSERT INTO lesoes (usuario_id, nome_identificacao, localizacao_corpo, observacoes)
           VALUES (?, ?, ?, ?);`,
          [pacienteId, 'Pinta no Antebraço Esquerdo', 'Antebraço Esquerdo', 'Bordas levemente irregulares, sem coceira.']
        );
        lesaoId = lesaoResult.insertId;
      }

      // 4. Fotografias de Exemplo (RN02, RN07)
      if (lesaoId) {
        const [fotosExistentes]: any = await pool.query(
          `SELECT id FROM fotos_lesao WHERE lesao_id = ?`,
          [lesaoId]
        );

        if (fotosExistentes.length === 0) {
          await pool.query(
            `INSERT INTO fotos_lesao (lesao_id, url_foto, observacao_foto)
             VALUES 
             (?, 'https://via.placeholder.com/300?text=Foto+Janeiro', 'Primeiro registro'),
             (?, 'https://via.placeholder.com/300?text=Foto+Fevereiro', 'Acompanhamento mensal');`,
            [lesaoId, lesaoId]
          );
        }
      }
    }

    console.log('✅ DADOS DE TESTE POVOADOS COM SUCESSO!');
    console.log('--------------------------------------------------');
    console.log('Paciente: paciente.teste@dermacheck.com | Senha: Senha123');
    console.log('Médico:   medico.teste@dermacheck.com   | Senha: Senha123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

criarUsuariosEDataTeste();