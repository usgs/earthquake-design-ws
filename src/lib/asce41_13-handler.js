'use strict';


var ASCE41_13Handler = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = options || {};

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      // TODO :: Create custom ASCE 41-13 Factory and use. Issue #64.
    }
  };


  /**
   * Checks params for null or undefined values.
   *
   * @param params {Object}
   *    Object containing required parameters.
   *
   * @return {Promise<array, Error>}
   *    A promise resolving with an array of missing parameter(s) and error or
   *    resolves with params if all values pass checks.
   */
  _this.checkParams = function (params) {
    var buf,
        err,
        latitude,
        longitude,
        siteClass;

    buf = [];

    latitude = params.latitude;
    longitude = params.longitude;
    siteClass = params.siteClass;

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
    }

    if (typeof siteClass === 'undefined' || siteClass === null) {
      buf.push('siteClass');
    }

    if (buf.length > 0) {
      err = new Error('Missing required parameter' +
          (buf.length > 1 ? 's' : '') + ': ' + buf.join(', '));
      err.status = 400;
      return Promise.reject(err);
    }

    return Promise.resolve(params);
  };

  /**
   * Destroy all the things.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Destroy more things

    _this.factory = null;
    _this.legacyFactory = null;

    _initialize = null;
    _this = null;
  };


  /**
   * Handles GET request for data
   *
   * @param params {object}
   *    request parameters.
   * @return {Promise}
   *    A promise that resolves with and error or calls
   *    factory.getDesignData with params.
   */
  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.factory.getDesignData(params);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ASCE41_13Handler;
