'use strict';


const ASCE7_10Factory = require('./asce7_10-factory'),
    extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


const _DEFAULTS = {
  referenceDocument: 'ASCE7-05'
};


/**
 * Class: ASCE7_05Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const ASCE7_05Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7_10Factory(options);


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
      let basicDesign,
          inputs,
          metadata,
          probabilistic;

      basicDesign = [];
      inputs = data.inputs;

      try {
        metadata = data.metadata;
        probabilistic = data.probabilistic.map((item) => {
          return item.response.data;
        });

        for (let i = 0, len = probabilistic.length; i < len; i++) {
          let probabilisticItem,
              result;

          probabilisticItem = probabilistic[i];
          result = {
            latitude:
                parseFloat(data.probabilistic[i].request.parameters.latitude),
            longitude:
                parseFloat(data.probabilistic[i].request.parameters.longitude)
          };

          // Compute Ss
          result.ss = _this.computeUniformHazard(probabilisticItem.ss,
              metadata.ssMaxDirFactor);

          // Compute S1
          result.s1 = _this.computeUniformHazard(probabilisticItem.s1,
              metadata.s1MaxDirFactor);

          basicDesign.push(result);
        }

        // interpolate ss and s1
        basicDesign = NumberUtils.spatialInterpolate(
            basicDesign,
            inputs.latitude,
            inputs.longitude,
            inputs.spatial_interpolation_method
          );

        resolve(basicDesign);
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
        sd1: null
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

        resolve(finalDesign);
      } catch (err) {
        reject(err);
      }
    });
  };

  _this.formatResult = function (result) {
    return new Promise((resolve, reject) => {
      let basicDesign,
          finalDesign,
          siteAmplification,
          spectra;

      try {
        basicDesign = result.basicDesign;
        finalDesign = result.finalDesign;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;


        resolve({
          data: {
            ss: NumberUtils.round(basicDesign.ss, _this.outputDecimals),
            fa: NumberUtils.round(siteAmplification.fa, _this.outputDecimals),
            fa_error: siteAmplification.fa_error,
            sms: NumberUtils.round(finalDesign.sms, _this.outputDecimals),
            sds: NumberUtils.round(finalDesign.sds, _this.outputDecimals),

            s1: NumberUtils.round(basicDesign.s1,
                _this.outputDecimals),
            fv: NumberUtils.round(siteAmplification.fv, _this.outputDecimals),
            fv_error: siteAmplification.fv_error,
            sm1: NumberUtils.round(finalDesign.sm1, _this.outputDecimals),
            sd1: NumberUtils.round(finalDesign.sd1, _this.outputDecimals),

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
      tSubL: null
    };

    return Promise.all([
      _this.probabilisticService.getData(inputs),
    ]).then((promiseResults) => {
      let probabilisticInputs;

      probabilisticInputs = extend(
          {gridSpacing: promiseResults[0].response.metadata.gridSpacing},
          inputs
        );

      return Promise.all([
        _this.makeMultipleRequests(
            NumberUtils.getGridPoints(probabilisticInputs),
            probabilisticInputs,
            _this.probabilisticService
          ),
        _this.metadataFactory.getMetadata(inputs),
        _this.tSubLService.getData(inputs)
      ]);
    }).then((promiseResults) => {
      result.probabilistic = promiseResults[0];
      result.metadata = promiseResults[1];
      result.tSubL = promiseResults[2].response.data['t-sub-l'];
      result.inputs = inputs;

      return _this.computeBasicDesign(result);
    }).then((basicDesign) => {
      result.basicDesign = basicDesign;

      return _this.siteAmplificationFactory.getSiteAmplificationData(
          extend(true, {}, inputs, basicDesign));
    }).then((siteAmplification) => {
      result.siteAmplification = siteAmplification;

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

      return _this.formatResult(result);
    });
  };

  options = null;
  return _this;
};


module.exports = ASCE7_05Factory;
