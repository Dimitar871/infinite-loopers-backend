// src/start.ts
import Express, { Application, Request, Response, NextFunction } from 'express';
import * as Dotenv from 'dotenv';
Dotenv.config({ path: '.env' });

import IndexRouter from './routes/index.js';
import { errorHandler } from './middleware/errors/errorHandler.js';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = Express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3012;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers - configured to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body parsers
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// Main routes
app.use('/', IndexRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new Error('Resource not found', { cause: 404 }));
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`🍿 Express running → PORT ${port}`);
});

// Keep the process alive
server.on('error', (error: Error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
