import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import redis from 'redis';
import mongoose from 'mongoose';
import comment from './routers/Comment.routers.js';
import vocab from './routers/Vocab.routers.js';
import user from './routers/User.routers.js';
import vocabTrainer from './routers/VocabTrainer.routers.js';
import vocabSubject from './routers/VocabSubject.routers.js';
import notification from './routers/Notification.routers.js';
import winston from 'winston';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import './utils/reminder/scheduler.js';
import { authenticateToken } from './middlewares/authenticateToken.js';
import { socketAuthMiddleware } from './middlewares/socketAuthMiddleware.js';
import { socketHandlers } from './middlewares/socketHandlers.js';

dotenv.config();

const port = process.env.LOCAL_PORT ?? 4030;
const databaseENV = process.env.DATABASE_URL ?? '';
const redisENV = process.env.REDIS_URL ?? 'redis://localhost:6379';
const isDevEnvironment =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const devOrigins = process.env.DEV_ALLOWED_ORIGINS?.split(',') || [];
const prodOrigins = process.env.PROD_ALLOWED_ORIGINS?.split(',') || [];

const app = express();
const server = createServer(app);

// Create Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: isDevEnvironment ? devOrigins : prodOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Export io for use in other modules
export const socketIO = io;

app.use(cookieParser());
app.use(
  cors({
    origin: isDevEnvironment ? devOrigins : prodOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/app1/comment', authenticateToken, comment);
app.use('/app1/user', user);
app.use('/app1/vocab', authenticateToken, vocab);
app.use('/app1/vocabTrainer', authenticateToken, vocabTrainer);
app.use('/app1/vocabSubject', authenticateToken, vocabSubject);
app.use('/app1/notification', authenticateToken, notification);

// Socket.IO setup with authentication middleware
io.use(socketAuthMiddleware);

// Socket.IO connection handling
io.on('connection', (socket) => {
  socketHandlers(
    socket as Socket & { user: { userId: string; email: string } },
    io
  );
});
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

const client = redis.createClient({
  url: redisENV,
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
    await mongoose.connect(databaseENV);
    console.log('Connected to DB');

    // Start the server
    server.listen(port, () => {
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
    res: express.Response
  ) => {
    logger.error(
      `${err.status ?? 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );

    console.error(err.stack);
    res.status(err.status ?? 500).json({
      status: 'error',
      statusCode: err.status ?? 500,
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

export default app;
