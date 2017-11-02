'use strict';


const extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance,
    SpectraFactory = require('./spectra-factory'),
    TargetGroundMotion = require('./target-ground-motion'),
    UhtHazardCurveFactory = require('./uht-hazard-curve-factory'),
    WebServiceAccessor = require('./util/web-service-accessor');


const _DEFAULTS = {
  factory: null,              // must be defined
  referenceDocument: 'ASCE41' // not real
};


const ASCE41Handler = function (options) {
  let _this,
      _initialize;


  _this = {};
  options = extend({}, _DEFAULTS, options);

  _initialize = function (options) {
    options = options || {};

    _this.referenceDocument = options.referenceDocument;

    if (options.factory) {
      _this.factory = options.factory({
        probabilisticService: WebServiceAccessor(
            {url: options.PROBABILISTIC_SERVICE_URL}),

        riskCoefficientService: WebServiceAccessor(
            {url: options.RISK_COEFFICIENT_SERVICE_URL}),

        deterministicService: WebServiceAccessor(
            {url: options.DETERMINISTIC_SERVICE_URL}),

        metadataService: WebServiceAccessor(
            {url: options.METADATA_SERVICE_URL}),

        tsublService: WebServiceAccessor(
            {url: options.TSUBL_SERVICE_URL}),

        siteAmplificationService: WebServiceAccessor(
            {url: options.SITE_AMPLIFICATION_SERVICE_URL}),

        spectraFactory: SpectraFactory(),

        uhtHazardCurveFactory: UhtHazardCurveFactory(),

        targetGroundMotion: TargetGroundMotion()
      });
    } else {
      throw new Error('A factory must be provided to the handler');
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
    let buf,
        err,
        latitude,
        longitude,
        siteClass;

    buf = [];

    params = params || {};
    params.referenceDocument = _this.referenceDocument;

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

    if (_this.factory) {
      _this.factory.destroy();
      _this.factory = null;
    }

    _initialize = null;
    _this = null;
  };

  _this.formatResult = function (result) {
    let formatted;

    return new Promise((resolve, reject) => {
      try {
        formatted = [];

        result.data.forEach((hazardLevel) => {
          var data;

          data = {};

          Object.keys(hazardLevel).forEach((key) => {
            var value;

            if (key === 'hazardLevel') {
              value = hazardLevel[key];
            } else if (key === 'customProbability') {
              value = parseFloat(hazardLevel[key]);
            } else if (key === 'horizontalSpectrum') {
              value = NumberUtils.roundSpectrum(hazardLevel[key]);
            } else {
              value = NumberUtils.round(hazardLevel[key]);
            }

            data[key] = value;
          });

          formatted.push(data);
        });

        process.stdout.write(JSON.stringify(result.metadata, null, 2));

        resolve({
          data: formatted,
          metadata: result.metadata
        });
      } catch (err) {
        return reject(err);
      }
    });
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
    }).then((result) => {
      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ASCE41Handler;
