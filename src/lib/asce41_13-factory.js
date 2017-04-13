'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  outputDecimals: 3
};


var ASCE41_13Factory = function (options) {
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

    _this.probabilisticService = options.probabilisticService;
    _this.riskCoefficientService = options.riskCoefficientService;
    _this.deterministicService = options.deterministicService;

    // TODO :: Replace with real metadata factory when ready
    _this.metadataFactory = {
      get: () => {
        return Promise.resolve({
          'floor_pgad': 0.5,
          'floor_s1d': 0.6,
          'floor_ssd': 1.5,
          'interpolation_method': 'linear',
          'max_direction_pga': 1.0,
          'max_direction_s1': 1.3,
          'max_direction_ss': 1.1,
          'model_version': 'v3.1.x',
          'percentile_pgad': 1.8,
          'percentile_s1d': 1.8,
          'percentile_ssd': 1.8
        });
      }
    };

    _this.probabilisticHazardFactory = options.probabilisticHazardFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
    _this.spectraFactory = options.spectraFactory;
  };


  _this.computeBse1E = function (/*inputs, metadata, bse1n*/) {
    // TODO
    return Promise.resolve({});
  };

  _this.computeBse2E = function (/*inputs, metadata, bse2n*/) {
    // TODO
    return Promise.resolve({});
  };

  _this.computeBse1N = function (bse2n) {
    // TODO
    return new Promise((resolve, reject) => {
      try {
        resolve({
          sxs: (2/3) * bse2n.sxs,
          sx1: (2/3) * bse2n.sx1,
          horizontalSpectrum: bse2n.horizontalSpectrum.map((value) => {
            return [
              (2/3) * value[0],
              (2/3) * value[1]
            ];
          })
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  _this.computeBse2N = function (inputs, metadata) {
    var cr1,
        crs,
        deterministicData,
        fa,
        fv,
        horizontalSpectrum,
        probabilisticData,
        riskCoefficientData,
        s1,
        s1d,
        s1rt,
        s1uh,
        ss,
        ssd,
        ssrt,
        ssuh,
        sx1,
        sxs;

    return Promise.all([
      _this.probabilisticService.getData(inputs),
      _this.riskCoefficientService.getData(inputs),
      _this.deterministicService.getData(inputs)
    ]).then((results) => {
      probabilisticData = results[0].response.data;
      riskCoefficientData = results[1].response.data;
      deterministicData = results[2].response.data;

      ssuh = probabilisticData.ss * metadata.max_direction_ss;
      s1uh = probabilisticData.s1 * metadata.max_direction_s1;

      crs = riskCoefficientData.crs;
      cr1 = riskCoefficientData.cr1;

      ssd = Math.max(metadata.floor_ssd,
          metadata.percentile_ssd * metadata.percentile_ssd * deterministicData.ssd);
      s1d = Math.max(metadata.floor_s1d,
          metadata.percentile_s1d * metadata.percentile_s1d * deterministicData.s1d);

      ssrt = ssuh * crs;
      s1rt = s1uh * cr1;

      ss = Math.min(ssd, ssrt);
      s1 = Math.min(s1d, s1rt);

      return _this.siteAmplificationFactory.getSiteAmplificationData({
        referenceDocument: inputs.referenceDocument,
        siteClass: inputs.siteClass,
        ss: ss,
        s1: s1
      });
    }).then((result) => {
      fa = result.fa;
      fv = result.fv;

      sxs = ss * fa;
      sx1 = s1 * fv;

      return _this.spectraFactory.getSpectrum(sxs, sx1);
    }).then((result) => {
      horizontalSpectrum = result;

      return {
        'hazardLevel': 'BSE-2N',
        'ssuh': ssuh,
        'crs': crs,
        'ssrt': ssrt,
        'ssd': ssd,
        'ss': ss,
        'fa': fa,
        'sxs': sxs,
        's1uh': s1uh,
        'cr1': cr1,
        's1rt': s1rt,
        's1d': s1d,
        's1': s1,
        'fv': fv,
        'sx1': sx1,
        'horizontalSpectrum': horizontalSpectrum
      };
    });
  };

  _this.computeMetadata = function (inputs) {
    return _this.metadataFactory.get(inputs);
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
  _this.get = function (inputs) {
    inputs = inputs || {};

    if (inputs.hasOwnProperty('customProbability')) {
      return _this.getCustomProbabilityDesignData(inputs);
    } else {
      return _this.getStandardDesignData(inputs);
    }
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

        return result;
      });
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
  _this.getStandardDesignData = function (inputs) {
    var bse1e,
        bse2e,
        bse1n,
        bse2n,
        metadata;

    return _this.computeMetadata(inputs).then((result) => {
      metadata = result;
      return _this.computeBse2N(inputs, metadata);
    }).then((result) => {
      bse2n = result;
      return _this.computeBse1N(bse2n);
    }).then((result) => {
      bse1n = result;
      return Promise.all([
        _this.computeBse1E(inputs, metadata, bse1n),
        _this.computeBse2E(inputs, metadata, bse2n)
      ]);
    }).then((results) => {
      bse1e = results[0];
      bse2e = results[1];
    }).then(() => {
      return {
        data: [
          bse2n,
          bse1n,
          bse2e,
          bse1e
        ],
        metadata: metadata
      };
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ASCE41_13Factory;
