'use strict';


var DeterministicFactory = require('./deterministic-factory'),
    extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {

};


var DeterministicHandler = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.destroyFactory = true;
      _this.factory = DeterministicFactory({
        db: options.db
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
