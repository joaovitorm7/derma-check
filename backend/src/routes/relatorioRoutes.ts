import { Router } from 'express';
import { RelatorioController } from '../controllers/relatorioController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// RN08 / CA08: Proteção obrigatória. Usuários não autorizados são bloqueados
router.use(authMiddleware);

// CA01: Obter dados estruturados do relatório
router.get('/', RelatorioController.obterRelatorioJSON);

// RN05 / CA04: Exportar arquivo PDF
router.get('/exportar-pdf', RelatorioController.exportarPDF);

export default router;