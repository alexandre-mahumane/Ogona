import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../config/database';
import { redis } from '../config/redis';

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    let database: 'up' | 'down' = 'down';
    let cache: 'up' | 'down' = 'down';

    try {
      await db.execute(sql`SELECT 1`);
      database = 'up';
    } catch {
      database = 'down';
    }

    try {
      const pong = await redis.ping();
      cache = pong === 'PONG' ? 'up' : 'down';
    } catch {
      cache = 'down';
    }

    const ok = database === 'up' && cache === 'up';
    res.status(ok ? 200 : 503).json({
      success: ok,
      data: {
        status: ok ? 'ok' : 'degraded',
        database,
        redis: cache,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const healthController = new HealthController();
