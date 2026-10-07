import { Router } from 'express';
import { getAllSimulations, getSimulationById } from '../controllers/simulations.controller.js';

const router = Router();

router.get('/', getAllSimulations);
router.get('/:id', getSimulationById);

export default router;
