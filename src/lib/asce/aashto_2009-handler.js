'use strict';


const AASHTO2009Factory = require('./aashto_2009-factory'),
    NSHMHandler = require('../basis/nshm-handler'),
    extend = require('extend'),
    NumberUtils = require('../util/number-utils').instance;

const _DEFAULTS = {
  factoryConstructor: AASHTO2009Factory,
  referenceDocument: 'AASHTO-2009'
};


const AASHTO2009Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMHandler(options);


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

    // DEBUG
    process.stdout.write('\r\n\r\nAASHTO-2009 Handler Result ==> ' + JSON.stringify(result));

    return new Promise((resolve, reject) => {
      let basicDesign,
          designCategory,
          finalDesign,
          metadata,
          sdSpectrum,
          siteAmplification,
          //smSpectrum,
          spectra;

      try {
        basicDesign = result.basicDesign;
        designCategory = result.designCategory;
        finalDesign = result.finalDesign;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;
        metadata = result.metadata;

        // DEBUG
        process.stdout.write('\r\n\r\nAASHTO-2009 Handler Result Metadata => ' + JSON.stringify(metadata));

        if (siteAmplification.fa === null || siteAmplification.fv === null) {
          sdSpectrum = null;
          //smSpectrum = null;
        } else {
          sdSpectrum = NumberUtils.roundSpectrum(spectra.sdSpectrum,
              _this.outputDecimals);
          //smSpectrum = NumberUtils.roundSpectrum(spectra.smSpectrum,
          //    _this.outputDecimals);
        }

        resolve({
          data: {
            pga: NumberUtils.round(basicDesign.pga, _this.outputDecimals),
            fpga: NumberUtils.round(siteAmplification.fpga, _this.outputDecimals),
            as: 'TODO - AS = FPGA x PGA the design PGA',
            ss: NumberUtils.round(basicDesign.ss, _this.outputDecimals),
            fa: NumberUtils.round(siteAmplification.fa, _this.outputDecimals),
            //sms: NumberUtils.round(finalDesign.sms, _this.outputDecimals),
            sds: NumberUtils.round(finalDesign.sds, _this.outputDecimals),
            //sdcs: designCategory.sdcs,

            s1: NumberUtils.round(basicDesign.s1,_this.outputDecimals),
            fv: NumberUtils.round(siteAmplification.fv, _this.outputDecimals),
            //sm1: NumberUtils.round(finalDesign.sm1, _this.outputDecimals),
            sd1: NumberUtils.round(finalDesign.sd1, _this.outputDecimals),
            sdc: designCategory.sdc,
            //sdc1: designCategory.sdc1,

            ts: 'TODO - TS = sd1 / sds in seconds, for construction of the design response spectrum',
            t0: 'TODO - T0 = 0.2TS in seconds, for construction of the design response spectrum',

            sdSpectrum: sdSpectrum
            //smSpectrum: smSpectrum
          },

          metadata: {
            griddedValuesID: '1998-HI-AASHTO-05-050-R1.rnd',
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