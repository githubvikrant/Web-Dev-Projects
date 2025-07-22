import { defineConfig } from '@mikro-orm/sqlite';
import path from 'path';

const config = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: [path.join(__dirname, '../dist/entities')],
  entitiesTs: [path.join(__dirname, './entities')],
  debug: process.env.NODE_ENV !== 'production',
});

export default config;