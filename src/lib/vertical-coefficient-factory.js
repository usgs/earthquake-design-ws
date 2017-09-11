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
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _this = null;
    _initialize = null;
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

          result.cv = NumberUtils.interpolateBinnedValue(data.bins,
              data.siteClasses[siteClass], inputs.ss);
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

  };

  _initialize(options);
  options = null;
  return _this;
};

module.exports = VerticalCoefficientFactory;
