'use strict';


const AbstractDataLoader = require('../abstract-data-loader'),
    Config = require('../../util/config'),
    dbUtils = require('../db-utils');


let config = Config().get(),
    documents = require('./documents.json'),
    regions = require('./regions.json');


dbUtils.getAdminDb().then((adminDb) => {
  let exitCode,
      loader;

  loader = AbstractDataLoader({
    dataColumns: [
      'latitude',
      'longitude',
      'pgad',
      's1d',
      'ssd'
    ],
    db: adminDb,
    documents: documents,
    indexFile: __dirname + '/./index.sql',
    regions: regions,
    schemaFile: __dirname + '/./schema.sql',
    schemaName: config.DB_SCHEMA_DETERMINISTIC,
    schemaUser: config.DB_USER
  });

  return loader.run().then(() => {
    process.stderr.write('Success!\n');
    exitCode = 0;
  }).catch((err) => {
    process.stderr.write('Error loading data\n');
    process.stderr.write(err.stack);
    exitCode = 1;
  }).then(() => {
    adminDb.end();
    process.exit(exitCode);
  });
});
