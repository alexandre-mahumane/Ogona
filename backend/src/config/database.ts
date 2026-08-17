import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env';
import * as schema from '../db/schema';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 60_000,
  connectionTimeoutMillis: 8_000,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

export const db = drizzle(pool, { schema });
