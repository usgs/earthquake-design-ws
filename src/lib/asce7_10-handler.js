'use strict';


const DesignCategoryFactory = require('./design-category-factory'),
    ASCE7_10Factory = require('./asce7_10-factory'),
    MetadataFactory = require('./metadata-factory'),
    SiteAmplificationFactory = require('./site-amplification-factory'),
    SpectraFactory = require('./spectra-factory'),
    WebServiceAccessor = require('./util/web-service-accessor');


/**
 * Handler for ASCE7-10 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const ASCE7_10Handler = function (options) {
  let _this,
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
      _this.destroyFactory = true;

      _this.factory = ASCE7_10Factory({
        probabilisticService: WebServiceAccessor(
          {url: options.PROBABILISTIC_SERVICE_URL}),
        riskCoefficientService: WebServiceAccessor(
          {url: options.RISK_COEFFICIENT_SERVICE_URL}),
        deterministicService: WebServiceAccessor(
          {url: options.DETERMINISTIC_SERVICE_URL}),
        metadataFactory: MetadataFactory(),
        tSubLService: WebServiceAccessor(
          {url: options.TSUBL_SERVICE_URL}),
        siteAmplificationFactory: SiteAmplificationFactory(),
        designCategoryFactory: DesignCategoryFactory(),
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
    let buf,
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

    if (_this.destroyFactory) {
      _this.factory.destroy();
      _this.factory = null;
    }

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
      return _this.factory.get(params);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = ASCE7_10Handler;
