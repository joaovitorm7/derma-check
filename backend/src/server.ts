import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import lesaoRoutes from './routes/lesaoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração completa do CORS para ambiente de desenvolvimento
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem (Web, Expo, Celular)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas públicas de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/lesoes', lesaoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Derma-check online' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor Derma-check rodando na porta ${PORT}`);
});