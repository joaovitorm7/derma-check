import { Router } from 'express';
import { cadastrarUsuario, loginUsuario } from '../controllers/authController';

const router = Router();

// Rota pública: Cadastro de usuários (CLIENTE ou PROFISSIONAL)
router.post('/cadastrar', cadastrarUsuario);
router.post('/register', cadastrarUsuario);

// Rota pública: Login de usuários
router.post('/login', loginUsuario);

export default router;