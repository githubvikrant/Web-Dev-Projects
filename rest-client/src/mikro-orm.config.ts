import { defineConfig } from '@mikro-orm/sqlite';
import { RequestHistory } from './entities/RequestHistory';

const config = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: [RequestHistory], // Pass the class directly
  debug: process.env.NODE_ENV !== 'production',
});

export default config;