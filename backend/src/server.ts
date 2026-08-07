import { sql } from 'drizzle-orm';
import { createApp } from './app';
import { db, pool } from './config/database';
import { env } from './config/env';
import { redis } from './config/redis';

async function bootstrap(): Promise<void> {
  await db.execute(sql`SELECT 1`);
  await redis.ping();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Ogona API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server:', error);
  await pool.end();
  redis.disconnect();
  process.exit(1);
});
