const { defineConfig } = require('@mikro-orm/sqlite');
const { RequestHistory } = require('./src/entities/RequestHistory');

module.exports = defineConfig({
  dbName: process.env.NODE_ENV === 'production'
    ? '/tmp/rest-client-db.sqlite'
    : 'rest-client-db.sqlite',
  entities: [RequestHistory],
  debug: process.env.NODE_ENV !== 'production',
}); 