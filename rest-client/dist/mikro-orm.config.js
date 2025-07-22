import { defineConfig } from '@mikro-orm/sqlite';
const config = defineConfig({
    dbName: 'rest-client-db.sqlite',
    entities: ['./dist/entities'], // use compiled JS entities at runtime
    entitiesTs: ['./src/entities'], // use TS entities for CLI/migrations
    debug: process.env.NODE_ENV !== 'production',
});
export default config;
