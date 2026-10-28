import bcrypt from 'bcrypt';
import { pool } from '../config/database';

async function criarUsuariosGlobais() {
  try {
    console.log('Gerando hash das senhas de teste...');
    const senhaPadrao = 'Senha123';
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);

    // 1. Usuário Paciente (CLIENTE)
    const queryPaciente = `
      INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nome = VALUES(nome);
    `;
    const valuesPaciente = [
      'Paciente de Teste',
      'paciente.teste@dermacheck.com',
      senhaHash,
      'CLIENTE',
      true
    ];

    // 2. Usuário Profissional (PROFISSIONAL)
    const queryProfissional = `
      INSERT INTO usuarios (nome, email, senha, tipo_usuario, crm, especialidade, telefone, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE nome = VALUES(nome);
    `;
    const valuesProfissional = [
      'Dr. Carlos Dermatologista',
      'medico.teste@dermacheck.com',
      senhaHash,
      'PROFISSIONAL',
      '123456/CE',
      'Dermatologia',
      '88999998888',
      true
    ];

    console.log('Inserindo usuários globais no banco de dados...');
    await pool.query(queryPaciente, valuesPaciente);
    await pool.query(queryProfissional, valuesProfissional);

    console.log(' USUÁRIOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('--------------------------------------------------');
    console.log('Paciente: paciente.teste@dermacheck.com | Senha: Senha123');
    console.log('Médico:   medico.teste@dermacheck.com   | Senha: Senha123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuários globais:', error);
    process.exit(1);
  }
}

criarUsuariosGlobais();