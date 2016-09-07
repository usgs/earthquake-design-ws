'use strict';

var designFactory = require('design-factory');
    express = require('express');


/**
 * Handler for earthquake design web service validates parameters and calls
 * designFactory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
var DesignHandler = function (options) {
  var _this,
      _initialize;

  _this = {};

  /**
   * Initializes a new handler instance.
   *
   * @param options {Object}
   *    Configuration options
   */
  _initialize = function (options) {
    options = options || {};

    _this.designFactory = options.designFactory || designFactory();
  };


  /**
   * Checks params for null or undefined values.
   *
   * @param params {Object}
   *    Object containing required parameters.
   *
   * @param {Promise<array, Error>}
   *    A promise resolving with an array of missing parameter(s) and error or
   *    resolves with params if all values pass checkes.
   */
  _this.checkParams = function (params) {
    var buf,
        err,
        latitude,
        longitude,
        referenceDocument,
        riskCategory,
        siteClass,
        title;

    buf = [];
    params = {};

    latitude = params.latitude;
    longitude = params.longitude;
    referenceDocument = params.referenceDocument;
    riskCategory = params.riskCategory;
    siteClass = params.siteClass;
    title = params.title;

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
    }

    if (typeof referenceDocument === 'undefined' ||
        referenceDocument === null ) {
      buf.push('referenceDocument');
    }

    if (typeof riskCategory === 'undefined' || riskCategory === null) {
      buf.push('riskCategory');
    }

    if (typeof siteClass === 'undefined' || siteClass === null) {
      buf.push('siteClass');
    }

    if (typeof title === 'undefined' || title === null) {
      buf.push('title');
    }

    if (buf.length > 0) {
      err = new Error('Missing required parameter' +
          (buf.length > 1 ? 's' : '') + buf.join(', '));
      err.status = 400;
      return Promise.reject(err);
    }

    return Promise.resolve(params);
  };

  /**
   * Destroy all the things.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    };

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
   *    designFactory.getDesignData with params.
   */
  _this.get = function (params) {
    return _this.checkParams(params).then((params) => {
      return _this.designFactory.getDesignData(params);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = DesignHandler;
