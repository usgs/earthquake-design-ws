'use strict';


const extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;

const _DEFAULTS = {
  outputDecimals: 3
};


const ASCE41_13Factory = function (options) {
  let _this,
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
    _this.tsublService = options.tsublService;

    _this.metadataFactory = options.metadataFactory;

    _this.uhtHazardCurveFactory = options.uhtHazardCurveFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
    _this.spectraFactory = options.spectraFactory;
    _this.targetGroundMotion = options.targetGroundMotion;
  };


  _this.computeBse1E = function (inputs, metadata, bse2n) {
    let customIn,
        fa,
        fv,
        horizontalSpectrum,
        s1,
        ss,
        sx1,
        sxs;

    customIn = extend({customProbability: 0.2}, inputs);

    return _this.getCustomProbabilityDesignData(customIn).then((result) => {
      let custom;

      custom = result.data[0];

      ss = custom.ss;
      s1 = custom.s1;
      fa = custom.fa;
      fv = custom.fv;

      sxs = Math.min(ss * fa, (2/3) * bse2n.ss * bse2n.fa);
      sx1 = Math.min(s1 * fv, (2/3) * bse2n.s1 * bse2n.fv);

      return _this.spectraFactory.getSpectrum(sxs, sx1);
    }).then((result) => {
      horizontalSpectrum = result;

      return {
        'hazardLevel': 'BSE-1E',
        'ss': ss,
        'fa': fa,
        'sxs': sxs,
        's1': s1,
        'fv': fv,
        'sx1': sx1,
        'horizontalSpectrum': horizontalSpectrum
      };
    });
  };

  _this.computeBse2E = function (inputs, metadata, bse2n) {
    let customIn,
        fa,
        fv,
        horizontalSpectrum,
        s1,
        ss,
        sx1,
        sxs;

    customIn = extend({customProbability: 0.05}, inputs);

    return _this.getCustomProbabilityDesignData(customIn).then((result) => {
      let custom;

      custom = result.data[0];

      ss = custom.ss;
      s1 = custom.s1;
      fa = custom.fa;
      fv = custom.fv;

      sxs = Math.min(ss * fa, bse2n.ss * bse2n.fa);
      sx1 = Math.min(s1 * fv, bse2n.s1 * bse2n.fv);

      return _this.spectraFactory.getSpectrum(sxs, sx1);
    }).then((result) => {
      horizontalSpectrum = result;

      return {
        'hazardLevel': 'BSE-2E',
        'ss': ss,
        'fa': fa,
        'sxs': sxs,
        's1': s1,
        'fv': fv,
        'sx1': sx1,
        'horizontalSpectrum': horizontalSpectrum
      };
    });
  };

  _this.computeBse1N = function (bse2n) {
    // TODO
    return new Promise((resolve, reject) => {
      try {
        resolve({
          'hazardLevel': 'BSE-1N',
          'sxs': (2/3) * bse2n.sxs,
          'sx1': (2/3) * bse2n.sx1,
          'horizontalSpectrum': bse2n.horizontalSpectrum.map((value) => {
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
    let cr1,
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

      ssd = Math.max(metadata.floor_ssd, metadata.percentile_ssd *
          metadata.max_direction_ss * deterministicData.ssd);
      s1d = Math.max(metadata.floor_s1d, metadata.percentile_s1d *
          metadata.max_direction_s1 * deterministicData.s1d);

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
    return _this.metadataFactory.getMetadata(inputs);
  };

  _this.tSubLData = {};

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

    return _this.tsublService.getData(inputs).then((result) => {
      _this.tSubLData = result.response.data;
      if (inputs.hasOwnProperty('customProbability')) {
        return _this.getCustomProbabilityDesignData(inputs);
      } else {
        return _this.getStandardDesignData(inputs);
      }
    });
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
    let fa,
        fv,
        horizontalSpectrum,
        metadata,
        s1,
        ss,
        sx1,
        sxs;

    inputs = inputs || {};

    return _this.computeMetadata(inputs).then((result) => {
      metadata = result;
      return _this.uhtHazardCurveFactory.getDesignCurves(inputs);
    }).then((result) => {
      let groundMotions;

      // Find target (mapped) ground motions for Ss and S1 from the curves and
      // the specified probability of exceedance
      groundMotions = result.SA0P2.map((ssCurve, index) => {
        let s1Curve;

        s1Curve = result.SA1P0[index];

        return {
          latitude: ssCurve.latitude,
          longitude: ssCurve.longitude,
          // TODO :: Fix this for HI which is interpolated in linear space...
          ss: _this.targetGroundMotion.getTargetedGroundMotion(
              ssCurve.data, inputs.customProbability,
              metadata.curve_interpolation_method),
          s1: _this.targetGroundMotion.getTargetedGroundMotion(
              s1Curve.data, inputs.customProbability,
              metadata.curve_interpolation_method)
        };
      });

      // Spatially interpolate targeted ground motions
      groundMotions = NumberUtils.spatialInterpolate(groundMotions,
          inputs.latitude, inputs.longitude,
          metadata.spatial_interpolation_method
      );

      //   groundMotions
      ss = groundMotions.ss * metadata.max_direction_ss;
      s1 = groundMotions.s1 * metadata.max_direction_s1;

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
        data: [{
          'hazardLevel': 'Custom',
          'customProbability': inputs.customProbability,
          'ss': ss,
          'fa': fa,
          'sxs': sxs,
          's1': s1,
          'fv': fv,
          'sx1': sx1,
          'horizontalSpectrum': horizontalSpectrum
        }],
        metadata: metadata
      };
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
    let bse1e,
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
        // Yes, use BSE-2N for BSE-1E because we need Ss and S1 values before
        // deterministic data is considered. We use BSE-2N for this data and
        // internally apply the 2/3 factor to re-compute BSE-1N intermediate
        // values. BSE-1E is capped as BSE-1N
        _this.computeBse1E(inputs, metadata, bse2n),
        // BSE-2E is capped at BSE-2N
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