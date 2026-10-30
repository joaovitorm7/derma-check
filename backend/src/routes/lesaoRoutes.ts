import { Router } from 'express';
import { LesaoController } from '../controllers/lesaoController';
import { authMiddleware }  from '../middlewares/authMiddleware';

const router = Router();

// RN10 / CA10: Proteção com autenticação em todas as rotas do módulo
router.use(authMiddleware);

router.post('/', LesaoController.registrarLesao);
router.get('/', LesaoController.listarLesoes);
router.get('/:id', LesaoController.obterDetalhesLesao);
router.post('/:id/fotos', LesaoController.adicionarFoto);
router.get('/:id/analise-demo', LesaoController.obterAnaliseDemonstrativa);
router.get('/:id/relatorios', LesaoController.obterRelatorios);

export default router;