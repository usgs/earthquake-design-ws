'use strict';


const GriddedDataFactory = require('./gridded-data-factory'),
    extend = require('extend'),
    Pool = require('./db/pool'),
    WebServiceAccessor = require('./util/web-service-accessor');


const _DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_SCHEMA: 'public',
  DB_USER: null
};


const GriddedDataHandler = function (options) {
  let _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = GriddedDataFactory({
        db: _this.createDbPool(options),
        metadataService: WebServiceAccessor(
          {url: options.METADATA_SERVICE_URL})
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

  _this.formatData = function (result) {
    let data;

    // make a copy so we don't muck up the original
    data = JSON.parse(JSON.stringify(result.data));

    // delete stuff that is not relevant to the data
    delete data.id;
    delete data.latitude;
    delete data.longitude;
    delete data.region_id;

    // return everything that is left
    return data;
  };

  _this.formatMetadata = function (result) {
    // pull some particular metadata off the original structure
    return {
      spatialInterpolationMethod:
          result.metadata.metadata.spatialInterpolationMethod,
      modelVersion: result.metadata.metadata.modelVersion,
      regionName: result.metadata.region.name,
      gridSpacing: result.metadata.region.grid_spacing
    };
  };

  _this.formatResult = function (result) {
    return new Promise((resolve, reject) => {
      try {
        return resolve({
          data: _this.formatData(result),
          metadata: _this.formatMetadata(result)
        });
      } catch (e) {
        return reject(e);
      }
    });
  };

  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.factory.get(params);
    }).then((result) => {
      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = GriddedDataHandler;
