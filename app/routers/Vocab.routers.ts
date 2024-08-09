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
import { VOCAB_CACHE_PREFIX } from '../utils/redis/constant';

const router = express.Router();

router.get('/', cacheMiddleware(VOCAB_CACHE_PREFIX, 60), getAllVocab);

router.get('/:id', getVocab);

router.get('/random/:amount', randomVocab);

router.post('/', addVocab);

router.put('/:id', updateVocab);

router.delete('/:id', removeVocab);

router.post('/deleteIds', removeMultiVocab);

export default router;
