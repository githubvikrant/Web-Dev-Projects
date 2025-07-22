const { SqliteDriver } = require('@mikro-orm/sqlite');
const { defineConfig } = require('@mikro-orm/core');

module.exports = defineConfig({
  driver: SqliteDriver,
  dbName: 'rest-client-db.sqlite',
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  debug: process.env.NODE_ENV !== 'production',
}); 