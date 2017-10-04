'use strict';


const AbstractDataLoader = require('../abstract-data-loader'),
    Config = require('../../util/config'),
    extend = require('extend');


let config = Config().get(),
    documents = require('./documents.json'),
    regions = require('./regions.json');

const _DEFAULTS = {
  dataColumns: [
    'value',
    'shape'
  ],
  db: null,
  documents: documents,
  indexFile: __dirname + '/./index.sql',
  missingOnly: false,
  regions: regions,
  schemaFile: __dirname + '/./schema.sql',
  schemaName: config.DB_SCHEMA_TSUBL,
  schemaUser: config.DB_USER,
  dataLoadOpts: 'WITH DELIMITER \'|\' CSV HEADER'
};

const TSubLDataLoader = function(options) {
  let _this;

  options = extend({}, _DEFAULTS, options);
  _this = AbstractDataLoader(options);


  options = null;
  return _this;
};


module.exports = TSubLDataLoader;
