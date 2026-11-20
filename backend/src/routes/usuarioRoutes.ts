import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Proteção via JWT em todas as rotas de Perfil e Configurações (Perfil RN10 / Config RN09)
router.use(authMiddleware);

router.get('/perfil', UsuarioController.obterPerfil);
router.put('/perfil', UsuarioController.editarPerfil);
router.patch('/senha', UsuarioController.alterarSenha);

export default router;