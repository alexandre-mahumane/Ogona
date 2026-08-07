import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';

export function setupSwagger(app: Express) {
  app.get('/api/docs.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument as unknown as Record<string, unknown>, {
      customSiteTitle: 'Ogona API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        tagsSorter: 'alpha',
      },
    }),
  );
}
