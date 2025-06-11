import express from 'express';
import {
  addVocab,
  getAllVocab,
  getVocab,
  getAllVocabByOneSubject,
  randomVocab,
  removeMultiVocab,
  removeVocab,
  updateVocab,
  addMultiVocab,
} from '../controllers/Vocab.controllers.js';

const router = express.Router();

router.get('/', getAllVocab);

router.get('/:id', getVocab);

router.get('/subject/:subjectId', getAllVocabByOneSubject);

router.get('/random/:amount', randomVocab);

router.post('/', addVocab as unknown as express.RequestHandler);

router.post('/bulk', addMultiVocab as unknown as express.RequestHandler);

router.put('/:id', updateVocab as unknown as express.RequestHandler);

router.delete('/:id', removeVocab as unknown as express.RequestHandler);

router.post(
  '/deleteIds',
  removeMultiVocab as unknown as express.RequestHandler
);

export default router;
