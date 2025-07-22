const { defineConfig } = require('@mikro-orm/sqlite');

module.exports = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: ['./src/entities'], // Use TS entities for both runtime and CLI
  debug: process.env.NODE_ENV !== 'production',
}); 