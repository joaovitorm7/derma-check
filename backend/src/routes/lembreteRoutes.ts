import { Router } from 'express';
import { LembreteController } from '../controllers/lembreteController';
import authMiddleware from '../middlewares/authMiddleware';
import { uploadFoto } from '../middlewares/uploadMiddleware';

const router = Router();

// RN10: Proteção via JWT para garantir que apenas usuários autorizados acessem seus lembretes
router.use(authMiddleware);

router.post('/', uploadFoto, LembreteController.criarLembrete);
router.get('/', LembreteController.listarLembretes);
router.patch('/:id/concluir', LembreteController.alternarStatus);
router.delete('/:id', LembreteController.deletarLembrete);

export default router;