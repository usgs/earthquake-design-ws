'use strict';


const NSHM_2002Factory = require('../basis/nshm_2002-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'AASHTO-2009'
};


/**
 * Class: AASHTO2009Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const AASHTO2009Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHM_2002Factory(options);


  /**
   * Computes Ss and S1 values from initial result `data` fetched from
   * the metadata- and probabilistic- factories.
   *
   * @param data {Array}
   *     An array containing 1,2, or 4 gridded data point results ...
   * @param data.metadata {Object}
   *     An object containing metadata for the calculation
   * @param data.probabilistic {Object}
   *     An object containing probabilistic hazard data for the caluclation
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing "ss" and "s1"
   *     keys with corresponding data.
   */
  _this.computeBasicDesign = function (data) {

    // return Promise.resolve({});
    return new Promise((resolve, reject) => {
      let probabilistic,
          result;

      try {
        result = {};
        probabilistic = data.probabilistic;

        result = {
          pga: probabilistic.response.data.pga,
          ss: probabilistic.response.data.ss,
          s1: probabilistic.response.data.s1
        };

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Computes the final ground motion values applying site amplification
   * factors and design (2/3) weighting.
   *
   * @param data {Object}
   *     An object containing `basicDesign` and `siteAmplification` information.
   * @param data.basicDesign {Object}
   *     An object containing `ss` and `s1`ground motion values
   * @param data.siteAmplification {Object}
   *     An object containing `fa` and `fv` ground motion values
   *
   * @return {Object}
   *    An object containing the final design ground motion data, namely:
   *    `sms`, `sm1`, `sds`, `sd1`
   */
  _this.computeFinalDesign = function (data) {
    // return Promise.resolve({});
    return new Promise((resolve, reject) => {
      let basicDesign,
          finalDesign,
          siteAmplification;

      finalDesign = {
        sms: null,
        sm1: null,
        sds: null,
        sd1: null,
        ts: null,
        t0: null
      };

      try {
        basicDesign = data.basicDesign;
        siteAmplification = data.siteAmplification;

        finalDesign.sms = _this.computeSiteModifiedValue(basicDesign.ss,
            siteAmplification.fa);
        finalDesign.sm1 = _this.computeSiteModifiedValue(basicDesign.s1,
            siteAmplification.fv);

        finalDesign.sds = _this.computeDesignValue(finalDesign.sms);
        finalDesign.sd1 = _this.computeDesignValue(finalDesign.sm1);

        finalDesign.ts = finalDesign.sd1 / finalDesign.sds;
        finalDesign.t0 = 0.2 * finalDesign.ts;

        resolve(finalDesign);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Computes the design PGA: AS = FPGA x PGA (Equation 3.4.1-1)
   *
   * @param data {Object}
   *     An object containing `FPGA` and `PGA` information.
   *
   * @return {Object}
   *    An object containing the final design ground motion data, namely:
   *    `as`
   */
  _this.computeDesignPGA = function (data) {
    // return Promise.resolve({});
    return new Promise((resolve, reject) => {
      let designPGA;

      designPGA = {
        as: null
      };

      try {
        designPGA.as = data.FPGA * data.PGA;

        resolve(designPGA);
      } catch (err) {
        reject(err);
      }
    });
  };

  _this.get = function (inputs) {
    let result;

    inputs = inputs || {};
    inputs.referenceDocument = _this.referenceDocument;

    result = {
      basicDesign: null,
      finalDesign: null,
      metadata: null,
      probabilistic: null,
      siteAmplification: null,
      //tSubL: null
      designPGA: null
    };

    return Promise.all([
      _this.probabilisticService.getData(inputs),
      _this.metadataService.getData(inputs),
      //_this.tSubLService.getData(inputs)
    ]).then((promiseResults) => {
      result.probabilistic = promiseResults[0];
      result.metadata = promiseResults[1];
      //result.tSubL = promiseResults[2].response.data['t-sub-l'];
      result.inputs = inputs;

      return _this.computeBasicDesign(result);
    }).then((basicDesign) => {
      result.basicDesign = basicDesign;

      return _this.siteAmplificationService.getData(
          extend(true, {}, inputs, basicDesign));
    }).then((siteAmplification) => {
      result.siteAmplification = siteAmplification.response.data;

      const dpgaData = {
        PGA: result.basicDesign.pga,
        FPGA: result.siteAmplification.fpga
      };

      return _this.computeDesignPGA(dpgaData);
    }).then((designPGA) => {
      result.designPGA = designPGA;

      return _this.computeFinalDesign(result);
    }).then((finalDesign) => {
      result.finalDesign = finalDesign;

      return Promise.all([
        _this.designCategoryFactory.getDesignCategory(inputs.riskCategory,
            result.basicDesign.s1, finalDesign.sds, finalDesign.sd1),
        _this.computeSpectra(finalDesign)
      ]);
    }).then((promiseResults) => {
      result.designCategory = promiseResults[0];
      result.spectra = promiseResults[1];

      return result;
    });
  };


  options = null;
  return _this;
};


module.exports = AASHTO2009Factory;
