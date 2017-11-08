'use strict';


const Config = require('../util/config'),
    SiteAmplificationFactory = require('./site-amplification-factory'),
    extend = require('extend'),
    Pool = require('../db/pool');

const _CONFIG = Config().get();

const _DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_SCHEMA: _CONFIG.DB_SCHEMA_SITE_AMPLIFICATION,
  DB_USER: null
};


const SiteAmplificationHandler = function (options) {
  let _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = SiteAmplificationFactory({
        db: _this.createDbPool(options)
      });
    }
  };


  _this.checkParams = function (params) {
    let buf,
        err,
        referenceDocument,
        s1,
        siteClass,
        ss;

    buf = [];

    referenceDocument = params.referenceDocument;
    s1 = params.s1;
    siteClass = params.siteClass;
    ss = params.ss;

    if (typeof referenceDocument === 'undefined' ||
        referenceDocument === null) {
      buf.push('referenceDocument');
    }

    if (typeof siteClass === 'undefined' || siteClass === null) {
      buf.push('siteClass');
    }

    if (typeof ss === 'undefined' || ss === null) {
      buf.push('ss');
    }

    if (typeof s1 === 'undefined' || s1 === null) {
      buf.push('s1');
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

  _this.formatData = function (result) {
    let data;

    // make a copy so we don't muck up the original
    data = JSON.parse(JSON.stringify(result));

    // return everything
    return data;
  };

  _this.formatMetadata = function (/*result*/) {
    // pull some particular metadata off the original structure
    return {};
  };

  _this.formatResult = function (result) {
    return new Promise((resolve) => {
      return resolve({
        data: _this.formatData(result),
        metadata: _this.formatMetadata(result)
      });
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


module.exports = SiteAmplificationHandler;
