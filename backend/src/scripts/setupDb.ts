import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function inicializarBanco() {
  try {
    console.log('⏳ Lendo e executando o arquivo schema.sql...');
    
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    // Executa as instruções SQL separadas por ponto e vírgula
    const queries = sqlScript
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    for (const query of queries) {
      await pool.query(query);
    }

    console.log('✅ Estrutura do banco de dados (schema.sql) criada/atualizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar estrutura do banco:', error);
    process.exit(1);
  }
}

inicializarBanco();