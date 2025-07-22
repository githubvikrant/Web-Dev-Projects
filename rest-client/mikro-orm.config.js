const { defineConfig } = require('@mikro-orm/sqlite');
const { RequestHistory } = require('./src/entities/RequestHistory');

module.exports = defineConfig({
  dbName: 'rest-client-db.sqlite',
  entities: [RequestHistory], // Pass the class directly
  debug: process.env.NODE_ENV !== 'production',
}); 