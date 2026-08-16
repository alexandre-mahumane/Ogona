import { pool } from '../config/database';
import { seedDemoData } from './seed-demo';

async function main() {
  console.log('Seeding Ogona demo data...');
  const result = await seedDemoData();
  console.log(result.reused ? 'Demo data already present (reused).' : 'Seed complete.');
  console.log('Host login:  842222222 / senha12345');
  console.log('Guest login: 841111111 / senha12345');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
