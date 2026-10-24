import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas públicas de Autenticação
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Derma-check online' });
});

app.listen(PORT, () => {
  console.log(`Servidor Derma-check rodando na porta ${PORT}`);
});