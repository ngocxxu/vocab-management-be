import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import redis from 'redis';
import mongoose from 'mongoose';
import comment from './routers/Comment.routers';
import vocab from './routers/Vocab.routers';
import vocabTrainer from './routers/VocabTrainer.routers';

dotenv.config();

const port = process.env.LOCAL_PORT || 4030;

const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);
app.use('/api/vocab', vocab);
app.use('/api/vocabTrainer', vocabTrainer);

const client = redis.createClient({
  url: process.env.REDIS_URL || 'https://localhost:6379',
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const redisClient = client;

async function connectRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
}

async function startServer() {
  try {
    await connectRedis();
    await mongoose.connect(process.env.DATABASE_URL || '');
    console.log('Connected to DB');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
);

process.on('SIGINT', async () => {
  await client.quit();
  await mongoose.connection.close();
  console.log('Connections closed. Exiting process.');
  process.exit(0);
});
