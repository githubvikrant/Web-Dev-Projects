const path = require('path');
const { defineConfig } = require('@mikro-orm/sqlite');

module.exports = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: [path.join(__dirname, 'dist/entities')],
  entitiesTs: [path.join(__dirname, 'src/entities')],
  debug: process.env.NODE_ENV !== 'production',
}); 