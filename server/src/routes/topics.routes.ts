import { Router } from 'express';
import { getAllTopics, getTopicBySlug } from '../controllers/topics.controller.js';

const router = Router();

router.get('/', getAllTopics);
router.get('/:slug', getTopicBySlug);

export default router;
