import {
  removeVocab,
  updateVocab,
  addVocab,
  getVocab,
  getAllVocab,
  removeMultiVocab,
  randomVocab,
} from '../controllers/Vocab.controllers';
import express from 'express';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';
import {
  ALL_VOCAB_CACHE_PREFIX,
  RANDOM_VOCAB_CACHE_PREFIX,
  TTL,
  VOCAB_CACHE_PREFIX,
} from '../utils/redis/constant';

const router = express.Router();

router.get('/', cacheMiddleware(ALL_VOCAB_CACHE_PREFIX, TTL), getAllVocab);

router.get('/:id', cacheMiddleware(VOCAB_CACHE_PREFIX, TTL), getVocab);

router.get(
  '/random/:amount',
  cacheMiddleware(RANDOM_VOCAB_CACHE_PREFIX, TTL),
  randomVocab
);

router.post('/', addVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

router.post('/deleteIds', removeMultiVocab);

export default router;
