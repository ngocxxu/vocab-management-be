import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import redis from 'redis';
import mongoose from 'mongoose';
import comment from './routers/Comment.routers';
import vocab from './routers/Vocab.routers';
import vocabTrainer from './routers/VocabTrainer.routers';
import winston from 'winston';
import helmet from 'helmet';

dotenv.config();

const port = process.env.LOCAL_PORT || 4030;

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api/comment', comment);
app.use('/api/vocab', vocab);
app.use('/api/vocabTrainer', vocabTrainer);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
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

app.use((req, res, next) => {
  if (!client.isOpen) {
    return res
      .status(503)
      .json({ message: 'Service Unavailable: Redis is down' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ message: 'Service Unavailable: Database is down' });
  }

  next();
});

app.use(
  (
    err: Error & { status?: number },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );

    console.error(err.stack);
    res.status(err.status || 500).json({
      status: 'error',
      statusCode: err.status || 500,
      message: err.message || 'Internal Server Error',
    });
  }
);

process.on('SIGINT', async () => {
  try {
    await client.quit();
    await mongoose.connection.close();
    console.log('Connections closed. Exiting process.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
});

startServer();
