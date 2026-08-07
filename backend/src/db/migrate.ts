import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/database';

async function runMigrations(): Promise<void> {
  const migrationsFolder = path.join(process.cwd(), 'drizzle');

  await migrate(db, { migrationsFolder });
  console.log('Drizzle migrations complete.');
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
