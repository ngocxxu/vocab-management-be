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

const router = express.Router();

router.get('/', getAllVocabTrainer);

router.get('/:id', getVocabTrainer);

router.get('/question/:id', getQuestions);

router.post('/', addVocabTrainer);

router.put('/:id', updateVocabTrainer);

router.put('/test/:id', updateTestVocabTrainer);

router.delete('/:id', removeVocabTrainer);

router.post('/deleteIds', removeMultiVocabTrainer);

export default router;
