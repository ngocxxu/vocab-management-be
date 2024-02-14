import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import comment from './routers/Comment.routers';
import vocab from './routers/Vocab.routers';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import schema from './schema/schema';

dotenv.config();

const port = process.env.PORT || 4030;

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({ schema, graphiql: process.env.NODE_ENV === 'development' })
);

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);
app.use('/api/vocab', vocab);

mongoose
  .connect(process.env.DATABASE_URL || '')
  .then(() => {
    console.log('Connected to DB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log('err', err);
  });
