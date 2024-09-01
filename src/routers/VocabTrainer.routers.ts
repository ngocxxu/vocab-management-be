import express from 'express';
import {
  addVocabTrainer,
  getAllVocabTrainer,
  getQuestions,
  getVocabTrainer,
  removeMultiVocabTrainer,
  removeVocabTrainer,
  updateTestVocabTrainer,
  updateVocabTrainer,
} from '../controllers/VocabTrainer.controllers.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';
import {
  ALL_VOCAB_TRAINER_CACHE_PREFIX,
  TTL,
  VOCAB_TRAINER_CACHE_PREFIX,
} from '../utils/redis.js';

const router = express.Router();

router.get(
  '/',
  cacheMiddleware(ALL_VOCAB_TRAINER_CACHE_PREFIX, TTL),
  getAllVocabTrainer
);

router.get(
  '/:id',
  cacheMiddleware(VOCAB_TRAINER_CACHE_PREFIX, TTL),
  getVocabTrainer
);

router.get('/question/:id', getQuestions);

router.post('/', addVocabTrainer);

router.put('/:id', updateVocabTrainer);

router.patch('/test/:id', updateTestVocabTrainer);

router.delete('/:id', removeVocabTrainer);

router.post('/deleteIds', removeMultiVocabTrainer);

export default router;
