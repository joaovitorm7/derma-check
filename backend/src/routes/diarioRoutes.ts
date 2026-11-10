import { Router } from 'express';
import { DiarioController } from '../controllers/diarioController';
import authMiddleware from '../middlewares/authMiddleware';
import { uploadFoto } from '../middlewares/uploadMiddleware';

const router = Router();

// RN10 / CA10: Proteção com autenticação JWT em todas as rotas do diário
router.use(authMiddleware);

router.post('/', uploadFoto, DiarioController.registrarDiario);
router.get('/', DiarioController.listarDiario);
router.get('/:id', DiarioController.obterDetalhesDiario);

export default router;