'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
};


var DesignFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.metadataFactory = options.metadataFactory;
    _this.probabilisticHazardFactory = options.probabilisticHazardFactory;
    _this.deterministicHazardFactory = options.deterministicHazardFactory;
    _this.riskTargetingFactory = options.riskTargetingFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
  };


  /**
   * Computes Ss, S1 and PGA values from initial result `data` fetched from
   * the metadata-, probabilistic-, deterministic-, and risk-targeting
   * factories.
   *
   * @param data {Object}
   *     An object containing initial result data ...
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
      var basicDesign,
          deterministic,
          metadata,
          pgad,
          probabilistic,
          riskCoefficients,
          s1d,
          s1uh,
          s1ur,
          ssd,
          ssuh,
          ssur;

      basicDesign = {
        ss: null,
        s1: null,
        pga: null
      };

      try {
        metadata = data.metadata;
        probabilistic = data.probabilistic;
        riskCoefficients = data.riskCoefficients;
        deterministic = data.deterministic;

        // Compute Ss
        ssuh = _this.computeUniformHazard(probabilistic.ss,
            metadata.ssMaxDirection);
        ssur = _this.computeUniformRisk(ssuh, riskCoefficients.crs);
        ssd = _this.computeDeterministic(deterministic.ss,
            metadata.ssPercentile, metadata.ssMaxDirection, metadata.ssdFloor);
        basicDesign.ss = _this.computeGroundMotion(ssur, ssd);

        // Compute S1
        s1uh = _this.computeUniformHazard(probabilistic.s1,
            metadata.s1MaxDirection);
        s1ur = _this.computeUniformRisk(s1uh, riskCoefficients.cr1);
        s1d = _this.computeDeterministic(deterministic.s1,
            metadata.s1Percentile, metadata.s1MaxDirection, metadata.s1dFloor);
        basicDesign.s1 = _this.computeGroundMotion(s1ur, s1d);

        // Compute PGA
        // Note :: Computations for PGA are a bit simpler than Ss/S1
        pgad = _this.computeDeterministic(deterministic.pga,
            metadata.pgaPercentile, 1.0, metadata.pgadFloor);
        basicDesign.pga = _this.computeGroundMotion(probabilistic.pga, pgad);

        resolve(basicDesign);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Computes the seismic design value based on a give `siteModifiedValue`.
   *
   * @param siteModifiedValue {Double}
   *     The site-modified ground motion value
   *
   * @return {Double}
   *     The seismic design value
   */
  _this.computeDesignValue = function (siteModifiedValue) {
    return (2/3) * siteModifiedValue;
  };

  /**
   * Computes the deterministic portion of the design ground motion.
   *
   * @param medianGroundMotion {Double}
   *     The 50 percentile mean deterministic ground motion value
   * @param percentileFactor {Double}
   *     Amplification factor to achieve target percentile ground motion
   * @param maxDirectionFactor {Double}
   *     Amplification factor to achieve max direction ground motion
   * @param floor {Double}
   *     A lower bound for the computed deterministic porition of the design
   *     ground motion
   *
   * @return {Double}
   *     The deterministic portion of the desired design ground motion
   */
  _this.computeDeterministic = function (medianGroundMotion, percentileFactor,
      maxDirectionFactor, floor) {
    var deterministic;

    deterministic = medianGroundMotion * percentileFactor * maxDirectionFactor;

    return Math.max(deterministic, floor);
  };

  /**
   * Computes the final ground motion values applying site amplification
   * factors and design (2/3) weighting.
   *
   * @param data {Object}
   *     An object containing `basicDesign` and `siteAmplification` information.
   * @param data.basicDesign {Object}
   *     An object containing `ss`, `s1` and `pga` ground motion values
   * @param data.siteAmplification {Object}
   *     An object containing `fa`, `fv` and `fpga` ground motion values
   *
   * @return {Object}
   *    An object containing the final design ground motion data, namely:
   *    `sms`, `sm1`, `pgam`, `sds`, `sd1`
   */
  _this.computeFinalDesign = function (data) {
    return new Promise((resolve, reject) => {
      var basicDesign,
          finalDesign,
          siteAmplification;

      finalDesign = {
        sms: null,
        sm1: null,
        pgam: null,
        sds: null,
        sd1: null
        // Note :: There is no dpga, this is not an omission
      };

      try {
        basicDesign = data.basicDesign;
        siteAmplification = data.siteAmplification;

        finalDesign.sms = _this.computeSiteModifiedValue(basicDesign.ss,
            siteAmplification.fa);
        finalDesign.sm1 = _this.computeSiteModifiedValue(basicDesign.s1,
            siteAmplification.fv);
        finalDesign.pgam = _this.computeSiteModifiedValue(basicDesign.pga,
            siteAmplification.fpga);

        finalDesign.sds = _this.computeDesignValue(finalDesign.sms);
        finalDesign.sd1 = _this.computeDesignValue(finalDesign.sm1);

        resolve(finalDesign);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Computes the site-independent (i.e. default soil condition B/C)
   * ground motions for purposes of design.
   *
   * @param probabilistic {Double}
   *     The probabilistic ground motion
   * @param deterministic {Double}
   *     The deterministic ground motion
   *
   * @return {Double}
   *     The site-independent ground motion for purposes of design
   */
  _this.computeGroundMotion = function (probabilistic, deterministic) {
    return Math.min(probabilistic, deterministic);
  };

  _this.computeSiteModifiedValue = function (groundMotion, amplification) {
    return groundMotion * amplification;
  };

  _this.computeUniformHazard = function (meanGroundMotion, maxDirectionFactor) {
    return meanGroundMotion * maxDirectionFactor;
  };

  _this.computeUniformRisk = function (uniformHazard, riskCoefficient) {
    return uniformHazard * riskCoefficient;
  };

  /**
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Free resources here ...

    _initialize = null;
    _this = null;
  };

  _this.formatResult = function (/*result*/) {
    return Promise.resolve({});
  };

  _this.getDesignData = function (inputs) {
    var result;

    result = {
      metadata: null,
      probabilistic: null,
      deterministic: null,
      riskCoefficients: null,
      siteAmplification: null,
      basicDesign: null,
      finalDesign: null
    };

    return Promise.all([
      _this.metadataFactory.getMetadata(inputs),
      _this.probabilisticHazardFactory.getProbabilisticData(inputs),
      _this.deterministicHazardFactory.getDeterministicData(inputs),
      _this.riskTargetingFactory.getRiskCoefficients(inputs)
    ]).then((promiseResults) => {
      // => [metadata, probabilistic, deterministic, riskCoefficients]
      result.metadata = promiseResults[0];
      result.probabilistic = promiseResults[1];
      result.deterministic = promiseResults[2];
      result.riskCoefficients = promiseResults[3];

      return _this.computeBasicDesign(result);
    }).then((basicDesign) => {
      result.basicDesign = basicDesign;

      return _this.siteAmplificationFactory.getAmplificationData(
          extend(true, {}, inputs, basicDesign));
    }).then((siteAmplification) => {
      result.siteAmplification = siteAmplification;

      return _this.computeFinalDesign(result);
    }).then((finalDesign) => {
      result.finalDesign = finalDesign;

      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = DesignFactory;
