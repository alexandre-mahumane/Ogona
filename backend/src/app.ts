import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { setupSwagger } from './docs/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { router } from './routes';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'Ogona API',
        version: '0.1.0',
        docs: '/api/docs',
        ping: '/ping',
      },
    });
  });

  app.get('/ping', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'pong',
        timestamp: new Date().toISOString(),
      },
    });
  });

  setupSwagger(app);

  app.use('/api/v1', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
