import { Router } from 'express';
import { searchGlobal } from '../controllers/search.controller.js';

const router = Router();

router.get('/', searchGlobal);

export default router;
