'use strict';


var RiskCoefficientFactory = require('./risk-coefficient-factory'),
    extend = require('extend'),
    Pool = require('./db/pool');


var _DEFAULTS;

_DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_SCHEMA: 'deterministic',
  DB_USER: null
};


var RiskCoefficientHandler = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);
    if (options.hasOwnProperty('DB_SCHEMA_COEFFICIENT')) {
      options.DB_SCHEMA = options.DB_SCHEMA_COEFFICIENT;
    }

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = RiskCoefficientFactory({
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
    options = options || _DEFAULTS;

    if (!_this.db) {
      _this.destroyDb = true;
      _this.db = Pool(extend(true, {}, options,
          {DB_SCHEMA: options.DB_SCHEMA_DETERMINISTIC}));
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
    return new Promise((resolve, reject) => {
      var formatted;

      try {
        formatted = {
          data: {
            cr1: result.data.cr1,
            crs: result.data.crs
          },
          metadata: {
            region_name: result.metadata.region.name,
            model_version: result.metadata.document.model_version,
            interpolation_method: result.metadata.document.interpolation_method
          }
        };

        return resolve(formatted);
      } catch (e) {
        return reject(e);
      }
    });
  };

  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.factory.getRiskTargetingData(params);
    }).then((result) => {
      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = RiskCoefficientHandler;