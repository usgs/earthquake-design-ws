'use strict';


const ASCE7Factory = require('./asce7-factory'),
    extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


const _DEFAULTS = {
  referenceDocument: ''
};


/**
 * Class: NSHM2008Factory
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
const NSHM2008Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Factory(options);


  /**
   * Computes Ss, S1 and PGA values from initial result `data` fetched from
   * the metadata-, probabilistic-, deterministic-, and risk-targeting
   * factories.
   *
   * @param data {Array}
   *     An array containing 1,2, or 4 gridded data point results ...
   * @param data.metadata {Object}
   *     An object containing metadata for the calculation
   * @param data.probabilistic {Object}
   *     An object containing probabilistic hazard data for the caluclation
   * @param data.deterministic {Object}
   *     An object containing deterministic hazard data for the calculation
   * @param data.riskCoefficients
   *     An object containing risk coefficient data for the calculation
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing "ss", "s1" and
   *     "pga" keys with corresponding data.
   */
  _this.computeBasicDesign = function (data) {
    // return Promise.resolve({});
    return new Promise((resolve, reject) => {
      let basicDesign,
          deterministic,
          inputs,
          metadata,
          probabilistic,
          riskCoefficients;

      basicDesign = [];
      inputs = data.inputs;

      try {
        metadata = data.metadata;
        probabilistic = data.probabilistic.map((item) => {
          return item.response.data;
        });
        riskCoefficients = data.riskCoefficients.map((item) => {
          return item.response.data;
        });
        deterministic = data.deterministic.map((item) => {
          return item.response.data;
        });

        for (let i = 0, len = probabilistic.length; i < len; i++) {
          let deterministicItem,
              probabilisticItem,
              result,
              riskCoefficientsItem;

          deterministicItem = deterministic[i];
          probabilisticItem = probabilistic[i];
          riskCoefficientsItem = riskCoefficients[i];
          result = {
            latitude: parseFloat(data.probabilistic[i].request.parameters.latitude),
            longitude: parseFloat(data.probabilistic[i].request.parameters.longitude)
          };

          // Compute Ss
          result.ssuh = _this.computeUniformHazard(probabilisticItem.ss,
              metadata.ssMaxDirFactor);
          result.crs = riskCoefficientsItem.crs;
          // Note: The sXrt values are computed _after_ spatial interpolation
          result.ssd = _this.computeDeterministic(deterministicItem.ssd,
              metadata.ssdPercentileFactor, metadata.ssMaxDirFactor,
              metadata.ssdFloor);

          // Compute S1
          result.s1uh = _this.computeUniformHazard(probabilisticItem.s1,
              metadata.s1MaxDirFactor);
          result.cr1 = riskCoefficientsItem.cr1;
          // Note: The sXrt values are computed _after_ spatial interpolation
          result.s1d = _this.computeDeterministic(deterministicItem.s1d,
              metadata.s1dPercentileFactor, metadata.s1MaxDirFactor,
              metadata.s1dFloor);

          // Compute PGA
          // Note :: Computations for PGA are a bit simpler than Ss/S1
          result.pgauh = _this.computeUniformHazard(probabilisticItem.pga, 1.0);
          result.pgad = _this.computeDeterministic(deterministicItem.pgad,
              metadata.pgadPercentileFactor, 1.0, metadata.pgadFloor);

          basicDesign.push(result);
        }

        // interpolate result
        basicDesign = NumberUtils.spatialInterpolate(basicDesign, inputs.latitude,
            inputs.longitude, inputs.spatial_interpolation_method);

        // compute prob. risk-targeted gm values
        basicDesign.ssrt = _this.computeUniformRisk(basicDesign.ssuh,
            basicDesign.crs);
        basicDesign.s1rt = _this.computeUniformRisk(basicDesign.s1uh,
            basicDesign.cr1);

        basicDesign.ss = _this.computeGroundMotion(basicDesign.ssrt,
            basicDesign.ssd);
        basicDesign.s1 = _this.computeGroundMotion(basicDesign.s1rt,
            basicDesign.s1d);
        basicDesign.pga = _this.computeGroundMotion(basicDesign.pgauh,
            basicDesign.pgad);

        resolve(basicDesign);
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
      deterministic: null,
      finalDesign: null,
      metadata: null,
      probabilistic: null,
      riskCoefficients: null,
      siteAmplification: null,
      tSubL: null
    };

    // TODO, use getGridPoints to build four separate requests to getData
    return Promise.all([
      _this.deterministicService.getData(inputs),
      _this.probabilisticService.getData(inputs),
      _this.riskCoefficientService.getData(inputs)
    ]).then((promiseResults) => {
      let deterministicInputs,
          probabilisticInputs,
          riskCoefficientInputs;

      deterministicInputs = extend(
          {gridSpacing: promiseResults[0].response.metadata.gridSpacing},
          inputs
      );
      probabilisticInputs = extend(
          {gridSpacing: promiseResults[1].response.metadata.gridSpacing},
          inputs
      );
      riskCoefficientInputs = extend(
          {gridSpacing: promiseResults[2].response.metadata.gridSpacing},
          inputs
      );

      return Promise.all([
        _this.makeMultipleRequests(
            NumberUtils.getGridPoints(deterministicInputs),
            deterministicInputs,
            _this.deterministicService
          ),
        _this.makeMultipleRequests(
            NumberUtils.getGridPoints(probabilisticInputs),
            probabilisticInputs,
            _this.probabilisticService
          ),
        _this.makeMultipleRequests(
            NumberUtils.getGridPoints(riskCoefficientInputs),
            riskCoefficientInputs,
            _this.riskCoefficientService
          ),
        _this.metadataFactory.getMetadata(inputs),
        _this.tSubLService.getData(inputs)
      ]);
    }).then((promiseResults) => {
      result.deterministic = promiseResults[0];
      result.probabilistic = promiseResults[1];
      result.riskCoefficients = promiseResults[2];
      result.metadata = promiseResults[3];
      result.tSubL = promiseResults[4].response.data['t-sub-l'];
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
        _this.designCategoryFactory.getDesignCategory(inputs.riskCategory,
            result.basicDesign.s1, finalDesign.sds, finalDesign.sd1),
        _this.computeSpectra(extend({tSubL: result.tSubL}, finalDesign))
      ]);
    }).then((promiseResults) => {
      result.designCategory = promiseResults[0];
      result.spectra = promiseResults[1];

      return result;
    });

  };

  _this.makeMultipleRequests = function (points, inputs, service) {
    let promises;

    promises = [];

    for (let i = 0, len = points.length; i < len; i++) {
      promises.push(
          service.getData({
            latitude: points[i].latitude,
            longitude: points[i].longitude,
            referenceDocument: inputs.referenceDocument
          })
      );
    }

    return Promise.all(promises);
  };


  options = null;
  return _this;
};


module.exports = NSHM2008Factory;
