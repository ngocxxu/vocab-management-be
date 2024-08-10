import {
  removeVocabTrainer,
  updateVocabTrainer,
  addVocabTrainer,
  getVocabTrainer,
  getAllVocabTrainer,
  removeMultiVocabTrainer,
  updateTestVocabTrainer,
  getQuestions,
} from '../controllers/VocabTrainer.controllers';
import express from 'express';
import {
  ALL_VOCAB_TRAINER_CACHE_PREFIX,
  QUESTION_VOCAB_TRAINER_CACHE_PREFIX,
  TTL,
  VOCAB_TRAINER_CACHE_PREFIX,
} from '../utils/redis/constant';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';

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

router.get(
  '/question/:id',
  cacheMiddleware(QUESTION_VOCAB_TRAINER_CACHE_PREFIX, TTL),
  getQuestions
);

router.post('/', addVocabTrainer);

router.put('/:id', updateVocabTrainer);

router.patch('/test/:id', updateTestVocabTrainer);

router.delete('/:id', removeVocabTrainer);

router.post('/deleteIds', removeMultiVocabTrainer);

export default router;
