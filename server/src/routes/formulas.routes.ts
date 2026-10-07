import { Router } from 'express';
import { getAllFormulas, getFormulaById } from '../controllers/formulas.controller.js';

const router = Router();

router.get('/', getAllFormulas);
router.get('/:id', getFormulaById);

export default router;
