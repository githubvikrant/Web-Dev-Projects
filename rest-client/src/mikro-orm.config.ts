import { defineConfig } from '@mikro-orm/sqlite';

const config = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: ['./src/entities'], // Use TS entities for both runtime and CLI
  debug: process.env.NODE_ENV !== 'production',
});

export default config;