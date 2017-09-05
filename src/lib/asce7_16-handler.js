'use strict';


var DesignCategoryFactory = require('./design-category-factory'),
    ASCE7_16Factory = require('./asce7_16-factory'),
    MetadataFactory = require('./metadata-factory'),
    SiteAmplificationFactory = require('./site-amplification-factory'),
    SpectraFactory = require('./spectra-factory'),
    WebServiceAccessor = require('./util/web-service-accessor');


/**
 * Handler for ASCE7-16 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
var ASCE7_16Handler = function (options) {
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

    if (options.factory) {
      _this.factory = options.factory;
    } else {
      _this.factory = ASCE7_16Factory({
        designCategoryFactory: DesignCategoryFactory(),
        deterministicService: WebServiceAccessor(
          {url: options.DETERMINISTIC_SERVICE_URL}),
        metadataFactory: MetadataFactory(),
        probabilisticService: WebServiceAccessor(
          {url: options.PROBABILISTIC_SERVICE_URL}),
        riskCoefficientService: WebServiceAccessor(
          {url: options.RISK_COEFFICIENT_SERVICE_URL}),
        siteAmplificationFactory: SiteAmplificationFactory(),
        spectraFactory: SpectraFactory()
      });
    }
  };


  /**
   * Checks params for null or undefined values.
   *
   * @param params {Object}
   *    Object containing required parameters.
   *
   * @param {Promise<array, Error>}
   *    A promise resolving with an array of missing parameter(s) and error or
   *    resolves with params if all values pass checks.
   */
  _this.checkParams = function (params) {
    var buf,
        err,
        latitude,
        longitude,
        riskCategory,
        siteClass,
        title;

    buf = [];

    latitude = params.latitude;
    longitude = params.longitude;
    riskCategory = params.riskCategory;
    siteClass = params.siteClass;
    title = params.title;

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
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
          (buf.length > 1 ? 's' : '') + ': ' + buf.join(', '));
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
    }

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

module.exports = ASCE7_16Handler;
