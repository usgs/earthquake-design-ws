'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS;

_DEFAULTS = {
  lookupTables: {
    'ASCE7-16': {
      'ss': {
        bins: [0.2, 0.3, 0.6, 1.0, 2.0],
        siteClasses: {
          'A': [0.7, 0.8, 0.9, 0.9, 0.9],
          'B': [0.7, 0.8, 0.9, 0.9, 0.9],
          'B-estimated': [0.7, 0.8, 0.9, 0.9, 0.9],
          'C': [0.7, 0.8, 1.0, 1.1, 1.3],
          'D': [0.7, 0.9, 1.1, 1.3, 1.5],
          'D-default': [0.7, 0.9, 1.1, 1.3, 1.5],
          'E': [0.7, 0.9, 1.1, 1.3, 1.5]
        }
      }
    }
  }
};


/**
 * Factory for computing vertical coefficient values Cv
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var VerticalCoefficientFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instances of a VerticalCoefficientFactory
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.lookupTables = options.lookupTables;
  };

  /**
   * Computes a single vertical coefficient value for given inputs.
   *
   * @param xvals {Array}
   *     An array containing the ground motion bins.
   * @param yvals {Array}
   *     An array containing vertical coefficient values corresponding to
   *     the xvals.
   * @param x {Double}
   *     The target ground motion for which to produce a vertical coefficient
   *     value.
   *
   * @return {Double}
   *     The coefficient value.
   */
  _this.getCoefficientFactor = function (xvals, yvals, x) {
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
        return NumberUtils.interpolate(xmin, ymin, xmax, ymax, x);
      }
    }

    throw new Error('Could not interpolate coefficient factor.');
  };

  /**
   * Computes the vertical coefficient value based on Ss value
   *
   * @param inputs {Object}
   *     Input parameters required to compute the vertical coefficient value.
   * @param inputs.referenceDocument {String}
   *     Well-known string identifying the reference document for which to
   *     compute vertical coefficient value.
   * @param inputs.siteClass {Integer|String}
   *     Text identifying the site-class for which to compute vertical
   *     coefficient value.
   * @param inputs.ss {Double} Optional
   *     The Ss value for which to compute Cv. If no `ss` value is present,
   *     the result object will contain a `cv` value of `undefined`.
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing
   *     the `cv` vertical coefficient values.
   */
  _this.getVerticalCoefficientData = function (inputs) {
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
              'vertical coefficient value.');
        }

        if (!siteClass) {
          throw new Error('"siteClass" must be provided to compute ' +
              'vertical coefficient value.');
        }

        if (!_this.lookupTables.hasOwnProperty(referenceDocument)) {
          throw new Error(`Unknown reference document "${referenceDocument}"`);
        }

        lookupTable = _this.lookupTables[referenceDocument];

        if (inputs.hasOwnProperty('ss')) {
          data = lookupTable.ss;

          result.cv = _this.getCoefficientFactor(data.bins,
              data.siteClasses[siteClass], inputs.ss);
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

  };

  _initialize(options);
  _this = null;
  return _this;
};

module.exports = VerticalCoefficientFactory;
