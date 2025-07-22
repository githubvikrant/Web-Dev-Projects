import { defineConfig } from '@mikro-orm/sqlite';
import { RequestHistory } from './entities/RequestHistory';

const config = defineConfig({
  dbName: process.env.NODE_ENV === 'production'
    ? '/tmp/rest-client-db.sqlite'
    : 'rest-client-db.sqlite',
  entities: [RequestHistory],
  debug: process.env.NODE_ENV !== 'production',
});

export default config;