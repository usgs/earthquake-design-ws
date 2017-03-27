'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  outputDecimals: 3 // Number of decimals to include in output
};


/**
 * Design factory computes design values. Basic inputs are forwarded along
 * to sub-factories to compute input data that is used in the algorithms
 * for computing design values compatible with specific building code
 * reference documents; specifically ASCE7-16.
 *
 * @param options {Object}
 *     Configuration options used to instantiate this factory. See
 *     #_initialize for details.
 */
var ASCE7_16Factory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor. Instantiates a new {ASCE7_16Factory
  } instance.
   *
   * @param options.metadataFactory {MetadataFactory}
   *     A factory for fetching metadata parameters for the building code
   *     reference document
   * @param options.probabilisticHazardFactory {ProbabilisticHazardFactory}
   *     A factory for fetching probabilistic hazard data
   * @param options.deterministicHazardFactory {DeterministicHazardFactory}
   *     A factory for fetching deterministic hazard data
   * @param options.riskTargetingFactory {RiskTargetingFactory}
   *     A factory for fetching risk coefficient data
   * @param options.siteAmplificationFactory {SiteAmplificationFactory}
   *     A factory for computing site-amplification factors
   * @param options.designCategoryFactory {DesignCategoryFactory}
   *     A factory for computing design category values
   * @param options.spectraFactory {SpectraFactory}
   *     A factory for computing spectra
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.outputDecimals = options.outputDecimals;

    _this.metadataFactory = options.metadataFactory;
    _this.probabilisticHazardFactory = options.probabilisticHazardFactory;
    _this.deterministicHazardFactory = options.deterministicHazardFactory;
    _this.riskTargetingFactory = options.riskTargetingFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
    _this.designCategoryFactory = options.designCategoryFactory;
    _this.spectraFactory = options.spectraFactory;
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
          probabilistic,
          riskCoefficients;

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
        basicDesign.ssuh = _this.computeUniformHazard(probabilistic.ss,
            metadata.ssMaxDirFactor);
        basicDesign.ssrt = _this.computeUniformRisk(basicDesign.ssuh,
            riskCoefficients.crs);
        basicDesign.ssd = _this.computeDeterministic(deterministic.ssd,
            metadata.ssdPercentileFactor, metadata.ssMaxDirFactor,
            metadata.ssdFloor);
        basicDesign.ss = _this.computeGroundMotion(basicDesign.ssrt,
            basicDesign.ssd);

        // Compute S1
        basicDesign.s1uh = _this.computeUniformHazard(probabilistic.s1,
            metadata.s1MaxDirFactor);
        basicDesign.s1rt = _this.computeUniformRisk(basicDesign.s1uh,
            riskCoefficients.cr1);
        basicDesign.s1d = _this.computeDeterministic(deterministic.s1d,
            metadata.s1dPercentileFactor, metadata.s1MaxDirFactor,
            metadata.s1dFloor);
        basicDesign.s1 = _this.computeGroundMotion(basicDesign.s1rt,
            basicDesign.s1d);

        // Compute PGA
        // Note :: Computations for PGA are a bit simpler than Ss/S1
        basicDesign.pgauh = _this.computeUniformHazard(probabilistic.pga, 1.0);
        basicDesign.pgad = _this.computeDeterministic(deterministic.pgad,
            metadata.pgadPercentileFactor, 1.0, metadata.pgadFloor);
        basicDesign.pga = _this.computeGroundMotion(probabilistic.pga,
            basicDesign.pgad);

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

  /**
   * Computes the site-modified ground motion for purposes of design.
   *
   * @param groundMotion {Double}
   *     The site-independent (i.e. default soil condition B/C) ground motion
   * @param amplification {Double}
   *     The amplification factor to apply
   *
   * @return {Double}
   *     The site-modified ground motion for purposes of design
   */
  _this.computeSiteModifiedValue = function (groundMotion, amplification) {
    return groundMotion * amplification;
  };

  /**
   * Computes spectra for site-modified and design values using the
   * `_this.spectraFactory`.
   *
   * @param params {Object}
   *     An object containing site-modified and design ground motion values.
   * @param params.sd1 {Double}
   *     The 1.0 second spectral period design ground motion
   * @param params.sds {Double}
   *     The 0.2 second spectral period design ground motion
   * @param params.sm1 {Double}
   *     The 1.0 second spectral period site-modified ground motion
   * @param params.sms {Double}
   *     The 0.2 second spectral period site-modified ground motion
   *
   * @return {Promise}
   *     A promise that resolves with an object containing `smSpectrum` and
   *     `sdSpectrum` keys whose values are an {XY_Series} representing the
   *     specified spectrum.
   */
  _this.computeSpectra = function (params) {
    var sd1,
        sds,
        sm1,
        sms;

    params = params || {};
    sms = params.sms;
    sm1 = params.sm1;
    sds = params.sds;
    sd1 = params.sd1;

    return Promise.all([
      _this.spectraFactory.getSpectrum(sms, sm1),
      _this.spectraFactory.getSpectrum(sds, sd1)
    ]).then((spectra) => {
      return {
        smSpectrum: spectra[0],
        sdSpectrum: spectra[1]
      };
    });
  };

  /**
   * Computes the uniform hazard.
   *
   * @param meanGroundMotion {Double}
   *     The geometric mean ground motion value
   * @param maxDirectionFactory {Double}
   *     The factor applied in order to achieve max-direction uniform hazard
   *
   * @return {Double}
   *     The uniform hazard value
   */
  _this.computeUniformHazard = function (meanGroundMotion, maxDirectionFactor) {
    return meanGroundMotion * maxDirectionFactor;
  };

  /**
   * Computes the uniform risk.
   *
   * @param uniformHazard {Double}
   *     The uniform hazard value
   * @param maxDirectionFactory {Double}
   *     The coefficient applied in order to achieve risk-targeted hazard
   *
   * @return {Double}
   *     The uniform hazard value
   */
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

  _this.formatResult = function (result) {
    return new Promise((resolve, reject) => {
      var basicDesign,
          designCategory,
          finalDesign,
          riskCoefficients,
          siteAmplification,
          spectra;

      try {
        basicDesign = result.basicDesign;
        designCategory = result.designCategory;
        finalDesign = result.finalDesign;
        riskCoefficients = result.riskCoefficients;
        siteAmplification = result.siteAmplification;
        spectra = result.spectra;

        resolve({
          data: {
            pgauh: _this.roundOutput(basicDesign.pgauh),
            pgad: _this.roundOutput(basicDesign.pgad),
            pga: _this.roundOutput(basicDesign.pga),
            fpga: _this.roundOutput(siteAmplification.fpga),
            pgam: _this.roundOutput(finalDesign.pgam),

            ssrt: _this.roundOutput(basicDesign.ssrt),
            crs: _this.roundOutput(riskCoefficients.crs),
            ssuh: _this.roundOutput(basicDesign.ssuh),
            ssd: _this.roundOutput(basicDesign.ssd),
            ss: _this.roundOutput(basicDesign.ss),
            fa: _this.roundOutput(siteAmplification.fa),
            sms: _this.roundOutput(finalDesign.sms),
            sds: _this.roundOutput(finalDesign.sds),
            sdcs: designCategory.sdcs,

            s1rt: _this.roundOutput(basicDesign.s1rt),
            cr1: _this.roundOutput(riskCoefficients.cr1),
            s1uh: _this.roundOutput(basicDesign.s1uh),
            s1d: _this.roundOutput(basicDesign.s1d),
            s1: _this.roundOutput(basicDesign.s1),
            fv: _this.roundOutput(siteAmplification.fv),
            sm1: _this.roundOutput(finalDesign.sm1),
            sd1: _this.roundOutput(finalDesign.sd1),
            sdc1: designCategory.sdc1,

            sdc: designCategory.sdc,
            // tl: result.tl,

            // TODO
            sdSpectrum: _this.roundSpectrum(spectra.sdSpectrum),
            smSpectrum: _this.roundSpectrum(spectra.smSpectrum)
          },

          metadata: extend(true, {}, result.metadata)
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  _this.getDesignData = function (inputs) {
    var result;

    result = {
      basicDesign: null,
      deterministic: null,
      finalDesign: null,
      metadata: null,
      probabilistic: null,
      riskCoefficients: null,
      siteAmplification: null
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

  /**
   * Rounds the given `value` to the given `precision` number of decimals.
   *
   * Note this uses JS rounding logic such that 0.5 values round towards
   * +Inf rather than away from 0.
   *
   * Note this only considers the `precision + 1` decimal value for rounding
   * and does not deal with any additional decimals for rounding. For example:
   *     roundOutput(1.450, 1) --> 1.5
   *     roundOutput(1.449, 1) --> 1.4
   *
   *
   * @param value {Decimal}
   *     The value to be rounded.
   * @param precision {Integer}
   *     The number of decimals to include in the rounded result.
   *
   * @return {Decimal}
   *     The rounded result.
   */
  _this.roundOutput = function (value, precision) {
    var factor,
        rounded;

    if (typeof precision === 'undefined') {
      precision = _this.outputDecimals;
    }

    factor = Math.pow(10, precision);

    if (precision < 1) {
      rounded = Math.round(factor);
    } else {
      factor = Math.pow(10, precision);
      rounded = Math.round(value * factor) / factor;
    }

    return rounded;
  };

  /**
   * Rounds the given `spectrum` values to the given `precision` number of
   * decimals.
   *
   * @param spectrum {Array}
   *     An array containing [x, y] data entries defininig the spectrum.
   * @param precision {Integer}
   *     The number of decimals to include in the rounded result entries.
   *
   * @return {Array}
   *     An array containing a spectrum where each entry value is rounded to
   *     the given precision.
   */
  _this.roundSpectrum = function (spectrum, precision) {
    return spectrum.map((entry) => {
      return [
        _this.roundOutput(entry[0], precision),
        _this.roundOutput(entry[1], precision)
      ];
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ASCE7_16Factory;
