import path from 'node:path';
import { config as loadEnv } from 'dotenv';

process.env.NODE_ENV = 'test';
loadEnv({ path: path.resolve(__dirname, '../.env.test'), override: true });
