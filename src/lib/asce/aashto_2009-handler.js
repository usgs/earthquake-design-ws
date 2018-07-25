'use strict';


const AASHTO2009Factory = require('./aashto_2009-factory'),
    NSHMHandler = require('../basis/nshm-handler'),
    extend = require('extend'),
    NumberUtils = require('../util/number-utils').instance;

const _DEFAULTS = {
  factoryConstructor: AASHTO2009Factory,
  referenceDocument: 'AASHTO-2009'
};

const GRIDDED_VALUE_FILES = {
  'E2002R1_US0P05_Probabilistic_05-050': '2002-US-AASHTO-05-050-R1.rnd',
  'E1998R1_HI0P02_Probabilistic_05-050': '1998-HI-AASHTO-05-050-R1.rnd',
  'E2003R1_PRVI0P05_Probabilistic_05-050': '2003-PRVI-AASHTO-05-050-R1.rnd',
  'E2006R1_AK0P10_Probabilistic_05-050': '2006-AK-AASHTO-05-050-R1.rnd'
};

const AASHTO2009Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMHandler(options);


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
        siteClass,
        title;

    buf = [];

    params = params || {};
    params.referenceDocument = _this.referenceDocument;

    latitude = params.latitude;
    longitude = params.longitude;
    siteClass = params.siteClass;
    title = params.title;

    if (typeof latitude === 'undefined' || latitude === null) {
      buf.push('latitude');
    }

    if (typeof longitude === 'undefined' || longitude === null) {
      buf.push('longitude');
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
   * Format the factory response
   *
   * @param result {Object}
   *    An object containing all of the data from the AASHTO-09 Factory
   *
   * @param {Promise<array>}
   *    A promise resolving with an an object response values and metadata
   *    values for the AASHTO-09 endpoint
   */
  _this.formatResult = function (result) {

    return new Promise((resolve, reject) => {
      let basicDesign,
          designCategory,
          finalDesign,
          metadata,
          sdSpectrum,
          siteAmplification,
          spectra,
          designPGA;

      try {
        basicDesign = result.basicDesign;
        designCategory = result.designCategory;
        finalDesign = result.finalDesign;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;
        metadata = result.metadata;
        designPGA = result.designPGA;

        if (siteAmplification.fa === null || siteAmplification.fv === null) {
          sdSpectrum = null;
        } else {
          sdSpectrum = NumberUtils.roundSpectrum(spectra.sdSpectrum,
              _this.outputDecimals);
        }

        resolve({
          data: {
            pga: NumberUtils.round(basicDesign.pga, _this.outputDecimals),
            fpga: NumberUtils.round(siteAmplification.fpga, _this.outputDecimals),
            as: NumberUtils.round(designPGA.as, _this.outputDecimals),

            ss: NumberUtils.round(basicDesign.ss, _this.outputDecimals),
            fa: NumberUtils.round(siteAmplification.fa, _this.outputDecimals),
            sds: NumberUtils.round(finalDesign.sds, _this.outputDecimals),

            s1: NumberUtils.round(basicDesign.s1,_this.outputDecimals),
            fv: NumberUtils.round(siteAmplification.fv, _this.outputDecimals),
            sd1: NumberUtils.round(finalDesign.sd1, _this.outputDecimals),
            sdc: designCategory,

            ts: NumberUtils.round(finalDesign.ts, _this.outputDecimals),
            t0: NumberUtils.round(finalDesign.t0, _this.outputDecimals),

            sdSpectrum: sdSpectrum
          },

          metadata: {
            griddedValuesID: GRIDDED_VALUE_FILES[result.probabilistic.response.metadata.regionName],
            spatialInterpolationMethod: metadata.response.data.spatialInterpolationMethod
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  };


  options = null;
  return _this;
};


module.exports = AASHTO2009Handler;
