'use strict';


const Config = require('./util/config'),
    MetadataFactory = require('./metadata-factory'),
    extend = require('extend'),
    Pool = require('./db/pool');

const _CONFIG = Config().get();

const _DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_SCHEMA: _CONFIG.DB_SCHEMA_METADATA,
  DB_USER: null
};


const MetadataHandler = function (options) {
  let _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    process.stdout.write(JSON.stringify(options, null, 2));

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = MetadataFactory({
        db: _this.createDbPool(options)
      });
    }
  };


  _this.checkParams = function (params) {
    let buf,
        err,
        latitude,
        longitude,
        referenceDocument;

    buf = [];

    latitude = params.latitude;
    longitude = params.longitude;
    referenceDocument = params.referenceDocument;

    if (typeof referenceDocument === 'undefined' ||
        referenceDocument === null) {
      buf.push('referenceDocument');
    }

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
    }

    // PGA values exist for some reference documents

    if (buf.length > 0) {
      err = new Error('Missing required parameter' +
          (buf.length > 1 ? 's' : '') + ': ' + buf.join(', '));
      err.status = 400;
      return Promise.reject(err);
    }

    return Promise.resolve(params);
  };

  _this.createDbPool = function (options) {
    options = options || _DEFAULTS;

    if (!_this.db) {
      _this.destroyDb = true;
      _this.db = Pool(options);
    }

    return _this.db;
  };

  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    if (_this.destroyFactory && _this.factory) {
      _this.factory.destroy();
      _this.factory = null;
    }

    if (_this.destroyDb) {
      _this.db.destroy(); // Technically async, but what would we do anyway?
    }

    _initialize = null;
    _this = null;
  };

  _this.formatResult = function (result) {
    return new Promise((resolve) => {
      return resolve({
        data: result,
        metadata: {}
      });
    });
  };

  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.factory.getMetadata(params);
    }).then((result) => {
      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MetadataHandler;
