'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS;

_DEFAULTS = {
  outputDecimals: 3
};


var ASCE41_14Factory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Initializes this factory.
   *
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.outputDecimals = options.outputDecimals;

    _this.probabilisticHazardFactory = options.probabilisticHazardFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
    _this.spectraFactory = options.spectraFactory;
  };


  /**
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  /**
   * Formats the result to match the specified API. Rounds output to the
   * desired number of decimals.
   *
   * @param result {Object}
   *     The result object to format. It should have all expected properties.
   *
   * @return {Promise}
   *     A promise that resolves with the formatted result object.
   */
  _this.formatResult = function (result) {
    result = result || {};

    [
      'ss', 'fa', 'sxs',
      's1', 'fv', 'sx1'
    ].forEach((key) => {
      result[key] = NumberUtils.round(result[key], _this.outputDecimals);
    });

    if (result.horizontalSpectrum) {
      result.horizontalSpectrum = NumberUtils.roundSpectrum(
          result.horizontalSpectrum, _this.outputDecimals);
    }

    return Promise.resolve(result);
  };

  /**
   * Gets ASCE 41-13 design data for a custom probability of exceedance.
   *
   * @param inputs {Object}
   *     An object containing necessary input parameters to compute the
   *     requested design data.
   *
   * @return {Promise}
   *     A promise that resolves with the design data result or rejects with
   *     an error if one should occur.
   */
  _this.getCustomProbabilityDesignData = function (inputs) {
    var result;

    inputs = inputs || {};

    result = {
      hazardLevel: 'Custom',
      customProbability: inputs.customProbability,
      ss: null,
      fa: null,
      sxs: null,
      s1: null,
      fv: null,
      sx1: null,
      horizontalSpectrum: null
    };

    return _this.probabilisticHazardFactory.getProbabilisticData(inputs)
      .then((output) => {
        result.ss = output.ss,
        result.s1 = output.s1;

        return _this.siteAmplificationFactory.getSiteAmplificationData(
          extend({}, result, inputs));
      }).then((output) => {
        result.fa = output.fa;
        result.fv = output.fv;
        result.sxs = result.ss * result.fa;
        result.sx1 = result.s1 * result.fv;

        return _this.spectraFactory.getSpectrum(result.sxs, result.sx1);
      }).then((output) => {
        result.horizontalSpectrum = output;

        return _this.formatResult(result);
      });
  };

  /**
   * Gets ASCE 41-13 design data for a request. If the request specifies a
   * custom probability of exceedance, performs custom calculations, otherwise
   * performs calculations for BSE-2N, BSE-1N, BSE-2E, and BSE-1E.
   *
   * Internally defers to one of `getCustomProbabilityDesignData` or
   * `getStandardDesignData`.
   *
   * @param inputs {Object}
   *     An object containing necessary input parameters to compute the
   *     requested design data.
   *
   * @return {Promise}
   *     A promise that resolves with the design data result or rejects with
   *     an error if one should occur.
   */
  _this.getDesignData = function (inputs) {
    inputs = inputs || {};
    inputs.referenceDocument = 'ASCE41-13';

    if (inputs.hasOwnProperty('customProbability')) {
      return _this.getCustomProbabilityDesignData(inputs);
    } else {
      return _this.getStandardDesignData(inputs);
    }
  };

  /**
   * Gets ASCE 41-13 design data for a pre-defined hazard levels.
   *
   * @param inputs {Object}
   *     An object containing necessary input parameters to compute the
   *     requested design data.
   *
   * @return {Promise}
   *     A promise that resolves with the design data result or rejects with
   *     an error if one should occur.
   */
  _this.getStandardDesignData = function (/*inputs*/) {
    // TODO :: Implement for BSE-2N, BSE-1N, BSE-2E, BSE-1E
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ASCE41_14Factory;
