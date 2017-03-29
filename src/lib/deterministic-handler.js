'use strict';


var DeterministicFactory = require('./deterministic-factory'),
    extend = require('extend'),
    pg = require('pg');


var _DEFAULTS;

_DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_USER: null
};


var DeterministicHandler = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = DeterministicFactory({
        db: _this.createDbPool(options)
      });
    }
  };


  _this.checkParams = function (params) {
    var buf,
        err,
        latitude,
        longitude,
        referenceDocument;

    buf = [];

    latitude = params.latitude;
    longitude = params.longitude;
    referenceDocument = params.referenceDocument;

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
    }

    if (typeof referenceDocument === 'undefined' ||
        referenceDocument === null) {
      buf.push('referenceDocument');
    }

    if (buf.length > 0) {
      err = new Error('Missing required parameter' +
          (buf.length > 1 ? 's' : '') + ': ' + buf.join(', '));
      err.status = 400;
      return Promise.reject(err);
    }

    return Promise.resolve(params);
  };

  _this.createDbPool = function (options) {
    _this.db = new pg.Pool({
      database: options.DB_DATABASE,
      host: options.DB_HOST,
      password: options.DB_PASSWORD,
      port: options.DB_PORT,
      user: options.DB_USER
    });
  };

  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    if (_this.destroyFactory && _this.factory) {
      _this.factory.destroy();
      _this.factory = null;
    }

    _initialize = null;
    _this = null;
  };

  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.factory.getDeterministicData(params);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = DeterministicHandler;
