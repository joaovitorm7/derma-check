import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { PASTA_UPLOADS } from './middlewares/uploadMiddleware';
import authRoutes from './routes/authRoutes';
import lesaoRoutes from './routes/lesaoRoutes';
import diarioRoutes from './routes/diarioRoutes';
import lembreteRoutes from './routes/lembreteRoutes';
import relatorioRoutes from './routes/relatorioRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração completa do CORS para ambiente de desenvolvimento
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem (Web, Expo, Celular)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas públicas de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/lesoes', lesaoRoutes);
app.use('/api/diario', diarioRoutes);
app.use('/api/lembretes', lembreteRoutes);
app.use('/api/relatorios', relatorioRoutes);

app.use('/uploads', express.static(PASTA_UPLOADS));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Derma-check online' });
});

// Erros do upload (arquivo grande ou tipo inválido) viram 400 em vez de 500.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const mensagem = err.code === 'LIMIT_FILE_SIZE'
      ? 'A imagem deve ter no máximo 10 MB.'
      : 'Envie uma imagem JPG, PNG, WEBP ou HEIC no campo "foto".';
    return res.status(400).json({ error: mensagem });
  }
  next(err);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor Derma-check rodando na porta ${PORT}`);
});