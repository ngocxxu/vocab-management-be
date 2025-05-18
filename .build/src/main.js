var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import redis from 'redis';
import mongoose from 'mongoose';
import comment from './routers/Comment.routers.js';
import vocab from './routers/Vocab.routers.js';
import user from './routers/User.routers.js';
import vocabTrainer from './routers/VocabTrainer.routers.js';
import vocabSubject from './routers/VocabSubject.routers.js';
import winston from 'winston';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import './utils/reminder/scheduler.js';
import { authenticateToken } from './middlewares/authenticateToken.js';
dotenv.config();
const port = (_a = process.env.LOCAL_PORT) !== null && _a !== void 0 ? _a : 4030;
const databaseENV = (_b = process.env.DATABASE_URL) !== null && _b !== void 0 ? _b : '';
const redisENV = (_c = process.env.REDIS_URL) !== null && _c !== void 0 ? _c : 'redis://localhost:6379';
const isDevEnvironment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: isDevEnvironment
        ? 'http://localhost:5173'
        : 'https://vocab-management.firebaseapp.com',
    credentials: true, // Allow cookie
}));
app.use(helmet());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use('/app1/comment', authenticateToken, comment);
app.use('/app1/user', user);
app.use('/app1/vocab', authenticateToken, vocab);
app.use('/app1/vocabTrainer', authenticateToken, vocabTrainer);
app.use('/app1/vocabSubject', authenticateToken, vocabSubject);
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
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log('Connected to Redis');
        }
        catch (err) {
            console.error('Failed to connect to Redis:', err);
        }
    });
}
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectRedis();
            yield mongoose.connect(databaseENV);
            console.log('Connected to DB');
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        }
        catch (err) {
            console.error('Failed to start server:', err);
        }
    });
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
app.use((err, req, res) => {
    var _a, _b, _c;
    logger.error(`${(_a = err.status) !== null && _a !== void 0 ? _a : 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    console.error(err.stack);
    res.status((_b = err.status) !== null && _b !== void 0 ? _b : 500).json({
        status: 'error',
        statusCode: (_c = err.status) !== null && _c !== void 0 ? _c : 500,
        message: err.message || 'Internal Server Error',
    });
});
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.quit();
        yield mongoose.connection.close();
        console.log('Connections closed. Exiting process.');
        process.exit(0);
    }
    catch (err) {
        console.error('Error during shutdown', err);
        process.exit(1);
    }
}));
startServer();
export default app;
