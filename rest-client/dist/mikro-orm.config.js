import { defineConfig } from '@mikro-orm/sqlite';
const config = defineConfig({
    dbName: 'rest-client-db.sqlite',
    entities: ['./dist/entities'], // Use compiled JS entities for runtime
    entitiesTs: ['./src/entities'], // Use TS entities for CLI/migrations
    debug: process.env.NODE_ENV !== 'production',
});
export default config;
