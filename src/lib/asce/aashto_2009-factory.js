'use strict';

var bs = require('binarysearch');


const NSHM_2002Factory = require('../basis/nshm_2002-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'AASHTO-2009'
};

// Used for DesignCategory Calculation
const _sd1Thresholds = [ 0, 0.15, 0.30, 0.50];
const sd1Map = ['A', 'B', 'C', 'D'];


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

  _this.computeSpectralAcceleration = function (data) {
    return new Promise((resolve, reject) => {
      try {
        return resolve({
          as: data.fpga * data.pga,
          sds: data.fa * data.ss,
          sd1: data.fv * data.s1
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  /**
   * Returns the Site Class based on the index of the sd1 value in the
   * _sd1Thresholds array.
   *
   * @param {Number} sd1
   *
   * @return {Promsie<String>}
   *     A promising resolving with the seismic design category identifier.
   */
  _this.calculateDesignCategory = function(sd1) {
    return new Promise((resolve, reject) => {
      try {
        let pos = bs.closest(_sd1Thresholds, sd1);
        return resolve(sd1Map[pos]);
      } catch (e) {
        return reject (e);
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
        as: null,
        sds: null,
        sd1: null
      };

      try {
        basicDesign = data.basicDesign;
        siteAmplification = data.siteAmplification;

        _this.computeSpectralAcceleration({
          fa: siteAmplification.fa,
          fpga: siteAmplification.fpga,
          fv: siteAmplification.fv,
          pga: basicDesign.pga,
          ss: basicDesign.ss,
          s1: basicDesign.s1
        }).then((spectralAcceleration) => {
          finalDesign.as = spectralAcceleration.as;
          finalDesign.sds = spectralAcceleration.sds;
          finalDesign.sd1 = spectralAcceleration.sd1;

          return resolve(finalDesign);
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  /**
   * Computes spectra for site-modified and design values using the
   * `_this.spectraFactory`.
   *
   * @param params {Object}
   *     An object containing design ground motion values.
   * @param params.as {Double}
   *     The PGA design ground motion
   * @param params.sd1 {Double}
   *     The 1.0 second spectral period design ground motion
   * @param params.sds {Double}
   *     The 0.2 second spectral period design ground motion
   *
   * @return {Promise}
   *     A promise that resolves with an object containing sdSpectrum data
   *     and parameterizing metadata.
   */
  _this.computeSpectra = function (params) {
    let pgad,
        sd1,
        sds;

    params = params || {};
    sds = params.sds;
    sd1 = params.sd1;
    pgad = params.as;

    return _this.spectraFactory.getAashtoSpectrum(sds, sd1, pgad);
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
      spectrum: null
    };

    return Promise.all([
      _this.probabilisticService.getData(inputs),
      _this.metadataService.getData(inputs),
    ]).then((promiseResults) => {
      result.probabilistic = promiseResults[0];
      result.metadata = promiseResults[1];
      result.inputs = inputs;

      return _this.computeBasicDesign(result);
    }).then((basicDesign) => {
      result.basicDesign = basicDesign;

      return _this.siteAmplificationService.getData(
          extend(true, {}, inputs, basicDesign));
    }).then((siteAmplification) => {
      result.siteAmplification = siteAmplification.response.data;

      return _this.computeFinalDesign(result);
    }).then((finalDesign) => {
      result.finalDesign = finalDesign;

      return Promise.all([
        _this.calculateDesignCategory(finalDesign.sd1),
        _this.computeSpectra(finalDesign)
      ]);
    }).then((promiseResults) => {
      result.designCategory = promiseResults[0];
      result.spectrum = promiseResults[1];

      return result;
    });
  };


  options = null;
  return _this;
};


module.exports = AASHTO2009Factory;
