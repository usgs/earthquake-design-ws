'use strict';


const DesignCategoryFactory = require('./design-category-factory'),
    extend = require('extend'),
    MetadataFactory = require('./metadata-factory'),
    NumberUtils = require('./util/number-utils').instance,
    SiteAmplificationFactory = require('./site-amplification-factory'),
    SpectraFactory = require('./spectra-factory'),
    WebServiceAccessor = require('./util/web-service-accessor');


const _DEFAULTS = {
  factoryConstructor: null,  // must be defined
  referenceDocument: 'ASCE7' // not real
};


/**
 * Base Handler for ASCE7 web services validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const ASCE7_Handler = function (options) {
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
    options = extend({}, _DEFAULTS, options);

    _this.referenceDocument = options.referenceDocument;

    if (options.factory) {
      _this.factory = options.factory;
    } else if (options.factoryConstructor) {
      _this.destroyFactory = true;

      _this.factory = options.factoryConstructor({
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

    params = params || {};
    params.referenceDocument = _this.referenceDocument;

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

  _this.formatResult = function (result) {
    return new Promise((resolve, reject) => {
      let basicDesign,
          designCategory,
          finalDesign,
          siteAmplification,
          spectra;

      try {
        basicDesign = result.basicDesign;
        designCategory = result.designCategory;
        finalDesign = result.finalDesign;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;


        resolve({
          data: {
            pgauh: NumberUtils.round(basicDesign.pgauh,
                _this.outputDecimals),
            pgad: NumberUtils.round(basicDesign.pgad,
                _this.outputDecimals),
            pga: NumberUtils.round(basicDesign.pga,
                _this.outputDecimals),
            fpga: NumberUtils.round(siteAmplification.fpga,
                _this.outputDecimals),
            pgam: NumberUtils.round(finalDesign.pgam,
                _this.outputDecimals),

            ssrt: NumberUtils.round(basicDesign.ssrt,
                _this.outputDecimals),
            crs: NumberUtils.round(basicDesign.crs,
                _this.outputDecimals),
            ssuh: NumberUtils.round(basicDesign.ssuh,
                _this.outputDecimals),
            ssd: NumberUtils.round(basicDesign.ssd,
                _this.outputDecimals),
            ss: NumberUtils.round(basicDesign.ss,
                _this.outputDecimals),
            fa: NumberUtils.round(siteAmplification.fa, _this.outputDecimals),
            fa_error: siteAmplification.fa_error,
            sms: NumberUtils.round(finalDesign.sms, _this.outputDecimals),
            sds: NumberUtils.round(finalDesign.sds, _this.outputDecimals),
            sdcs: designCategory.sdcs,

            s1rt: NumberUtils.round(basicDesign.s1rt,
                _this.outputDecimals),
            cr1: NumberUtils.round(basicDesign.cr1,
                _this.outputDecimals),
            s1uh: NumberUtils.round(basicDesign.s1uh,
                _this.outputDecimals),
            s1d: NumberUtils.round(basicDesign.s1d,
                _this.outputDecimals),
            s1: NumberUtils.round(basicDesign.s1,
                _this.outputDecimals),
            fv: NumberUtils.round(siteAmplification.fv, _this.outputDecimals),
            fv_error: siteAmplification.fv_error,
            sm1: NumberUtils.round(finalDesign.sm1, _this.outputDecimals),
            sd1: NumberUtils.round(finalDesign.sd1, _this.outputDecimals),
            sdc1: designCategory.sdc1,

            sdc: designCategory.sdc,
            't-sub-l': result.tSubL,

            sdSpectrum: (siteAmplification.fa === null || siteAmplification.fv === null) ?
                null :
                NumberUtils.roundSpectrum(spectra.sdSpectrum, _this.outputDecimals),
            smSpectrum: (siteAmplification.fa === null || siteAmplification.fv === null) ?
                null :
                NumberUtils.roundSpectrum(spectra.smSpectrum, _this.outputDecimals)
          },

          metadata: extend(true, {}, result.metadata)
        });
      } catch (err) {
        reject(err);
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

module.exports = ASCE7_Handler;
