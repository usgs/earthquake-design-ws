'use strict';


const ASCE7_05Factory = require('./asce7_05-factory'),
    ASCE7Handler = require('./asce7-handler'),
    extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;

const _DEFAULTS = {
  factoryConstructor: ASCE7_05Factory,
  referenceDocument: 'ASCE7_05'
};


const ASCE7_05Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Handler(options);


  /**
   * Format the factory response
   *
   * @param result {Object}
   *    An object containing all of the data from the ASCE7-05Factory
   *
   * @param {Promise<array>}
   *    A promise resolving with an an object response values and metadata
   *    values for the ASCE7-05 endpoint
   */
  _this.formatResult = function (result) {
    return new Promise((resolve, reject) => {
      let basicDesign,
          designCategory,
          finalDesign,
          metadata,
          sdSpectrum,
          siteAmplification,
          smSpectrum,
          spectra;

      try {
        basicDesign = result.basicDesign;
        designCategory = result.designCategory;
        finalDesign = result.finalDesign;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;
        metadata = result.metadata;

        if (siteAmplification.fa === null || siteAmplification.fv === null) {
          sdSpectrum = null;
          smSpectrum = null;
        } else {
          sdSpectrum = NumberUtils.roundSpectrum(spectra.sdSpectrum,
              _this.outputDecimals);
          smSpectrum = NumberUtils.roundSpectrum(spectra.smSpectrum,
              _this.outputDecimals);
        }

        resolve({
          data: {
            ss: NumberUtils.round(basicDesign.ss, _this.outputDecimals),
            fa: NumberUtils.round(siteAmplification.fa, _this.outputDecimals),
            sms: NumberUtils.round(finalDesign.sms, _this.outputDecimals),
            sds: NumberUtils.round(finalDesign.sds, _this.outputDecimals),
            sdcs: designCategory.sdcs,

            s1: NumberUtils.round(basicDesign.s1,_this.outputDecimals),
            fv: NumberUtils.round(siteAmplification.fv, _this.outputDecimals),
            sm1: NumberUtils.round(finalDesign.sm1, _this.outputDecimals),
            sd1: NumberUtils.round(finalDesign.sd1, _this.outputDecimals),
            sdc1: designCategory.sdc1,

            sdc: designCategory.sdc,
            't-sub-l': result.tSubL,

            sdSpectrum: sdSpectrum,
            smSpectrum: smSpectrum
          },

          metadata: {
            spatialInterpolationMethod: metadata.spatialInterpolationMethod
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


module.exports = ASCE7_05Handler;