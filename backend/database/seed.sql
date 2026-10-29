-- Garante a seleção do banco correto
USE derma_check;

-- Insere Paciente de Teste (Senha: Senha123)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo)
VALUES (
  'Paciente de Teste',
  'paciente.teste@dermacheck.com',
  '$2b$10$S9GjvhX78W3kX6A8L031A.lA2M8F02gWkL3eN1X5oO7P8Q9R0S1T2',
  'CLIENTE',
  1
) ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Insere Profissional de Teste (Senha: Senha123)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, crm, especialidade, telefone, ativo)
VALUES (
  'Dr. Carlos Dermatologista',
  'medico.teste@dermacheck.com',
  '$2b$10$S9GjvhX78W3kX6A8L031A.lA2M8F02gWkL3eN1X5oO7P8Q9R0S1T2',
  'PROFISSIONAL',
  '123456/CE',
  'Dermatologia',
  '88999998888',
  1
) ON DUPLICATE KEY UPDATE nome = VALUES(nome);