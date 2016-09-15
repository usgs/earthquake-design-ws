'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  lookupTables: {
    'ASCE7-16': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25, 1.50],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B (measured)': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B (unmeasured)': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
          'D (determined)': [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
          'D (default)': [1.6, 1.4, 1.2, 1.2, 1.2, 1.2],
          'E': [2.4, 1.7, 1.3, 1.2, 1.2, 1.2]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B (measured)': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B (unmeasured)': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.5, 1.5, 1.5, 1.5, 1.5, 1.4],
          'D (determined)': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'D (default)': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'E': [4.2, 3.3, 2.8, 2.4, 2.2, 2.0]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B (measured)': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B (unmeasured)': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.2, 1.2, 1.2, 1.2, 1.2],
          'D (determined)': [1.6, 1.4, 1.3, 1.2, 1.1, 1.1],
          'D (default)': [1.6, 1.4, 1.3, 1.2, 1.2, 1.2],
          'E': [2.4, 1.9, 1.6, 1.4, 1.2, 1.1]
        }
      }
    }
  }
};


/**
 * Factory for computing site amplification values "Fa", "Fv", and "Fpga"
 * corresponding to a given "Ss", "S1", and "PGA" respectively for a given
 * reference document.
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var SiteAmplificationFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instances of a SiteAmplificationFactory
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.lookupTables = options.lookupTables;
  };


  /**
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Free resources here

    _initialize = null;
    _this = null;
  };

  /**
   * Computes a single amplification factor for given inputs.
   *
   * @param xvals {Array}
   *     An array containing the ground motion bins.
   * @param yvals {Array}
   *     An array containing amplification factors corresponding to the xvals.
   * @param x {Double}
   *     The target ground motion for which to produce an amplification factor.
   *
   * @return {Double}
   *     The amplification factor.
   */
  _this.getAmplificationFactor = function (xvals, yvals, x) {
    var i,
        numVals,
        xmax,
        xmin,
        ymax,
        ymin;

    numVals = xvals.length;

    // check lower bound
    if (x <= xvals[0]) {
      return yvals[0];
    }

    // check upper bound
    if (x >= xvals[numVals - 1]) {
      return yvals[numVals - 1];
    }

    for (i = 1; i < numVals; i++) {
      xmin = xvals[i - 1];
      xmax = xvals[i];
      ymin = yvals[i - 1];
      ymax = yvals[i];

      if (xmin <= x && x <= xmax) {
        return _this.interpolate(xmin, xmax, ymin, ymax, x);
      }
    }

    throw new Error('Could not interpolate amplification factor.');
  };

  /**
   * Computes the site amplification coefficient values.
   *
   * @param inputs {Object}
   *     Input parameters required to compute the site amplification.
   * @param inputs.referenceDocument {String}
   *     Well-known string identifying the reference document for which to
   *     compute site-amplification values.
   * @param inputs.siteClass {Integer|String}
   *     Text identifying the site-class for which to compute
   *     site-amplification values.
   * @param inputs.ss {Double} Optional
   *     The Ss value for which to compute Fa. If no `ss` value is present,
   *     the result object will contain an `fa` value of `null`.
   * @param inputs.s1 {Double} Optional
   *     The S1 value for which to compute Fv. If no `s1` value is present,
   *     the result object will contain an `fv` value of `null`.
   * @param inputs.pga {Double} Optional
   *     The PGA value for which to compute Fpga. If no `pga` value is present,
   *     the result object will contain an `fpga` value of `null`.
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing
   *     the `fa`, `fv`, and `fpga` site amplification values.
   */
  _this.getSiteAmplificationData = function (inputs) {
    var data,
        lookupTable,
        referenceDocument,
        result,
        siteClass;

    return new Promise((resolve, reject) => {
      try {
        result = {};

        referenceDocument = inputs.referenceDocument;
        siteClass = inputs.siteClass;

        if (!referenceDocument) {
          throw new Error('"referenceDocument" must be provided to compute ' +
              'site amplification values.');
        }

        if (!siteClass) {
          throw new Error('"siteClass" must be provided to compute site ' +
              'amplification values.');
        }

        if (!_this.lookupTables.hasOwnProperty(referenceDocument)) {
          throw new Error(`Unknown reference document "${referenceDocument}"`);
        }

        lookupTable = _this.lookupTables[referenceDocument];

        if (inputs.hasOwnProperty('ss')) {
          data = lookupTable.ss;
          result.fa = _this.getAmplificationFactor(data.bins,
              data.siteClasses[siteClass], inputs.ss);
        }

        if (inputs.hasOwnProperty('s1')) {
          data = lookupTable.s1;
          result.fv = _this.getAmplificationFactor(data.bins,
              data.siteClasses[siteClass], inputs.s1);
        }

        if (inputs.hasOwnProperty('pga')) {
          data = lookupTable.pga;
          result.fpga = _this.getAmplificationFactor(data.bins,
              data.siteClasses[siteClass], inputs.pga);
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Performs generic linear interpolation.
   *
   * @param xmin {Double}
   *     The lower x-value
   * @param xmax {Double}
   *     The upper x-value
   * @param ymin {Double}
   *     The lower y-value
   * @param ymax {Double}
   *     The upper y-value
   * @param x {Double}
   *     The target x-value
   *
   * @return {Double}
   *     The interpolated y-value corresponding to the input target x-value.
   */
  _this.interpolate = function (xmin, xmax, ymin, ymax, x) {
    return ymin + ((x - xmin) * ((ymax - ymin) / (xmax - xmin)));
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = SiteAmplificationFactory;
