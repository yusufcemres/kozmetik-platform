import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join, resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });

const useUrl = !!process.env.DATABASE_URL;

export default new DataSource({
  type: 'postgres',
  ...(useUrl
    ? {
        url: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL!.includes('neon.tech')
          ? { rejectUnauthorized: false }
          : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'kozmetik',
        password: process.env.DB_PASS || 'kozmetik_dev',
        database: process.env.DB_NAME || 'kozmetik_platform',
      }),
  entities: [join(__dirname, 'entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
