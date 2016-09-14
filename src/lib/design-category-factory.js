'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  lookupTables: {
    'sds': {
      bins: [0, 0.167, 0.33, 0.50],
      riskCategories: {
        'I':   ['A', 'B', 'C', 'D'],
        'II':  ['A', 'B', 'C', 'D'],
        'III': ['A', 'B', 'C', 'D'],
        'IV':  ['A', 'C', 'D', 'D']
      }
    },
    'sd1': {
      bins: [0, 0.067, 0.133, 0.20],
      riskCategories: {
        'I':   ['A', 'B', 'C', 'D'],
        'II':  ['A', 'B', 'C', 'D'],
        'III': ['A', 'B', 'C', 'D'],
        'IV':  ['A', 'C', 'D', 'D']
      }
    }
  }
};


/**
 * Factory for determining the Design Category from the Risk Category and
 * "s1", "sds", and "sd1" values.
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var DesignCategoryFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instances of a DesignCategoryFactory
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

    _initialize = null;
    _this = null;
  };

  /**
   * Determines the correct design category value.
   *
   * @param riskCategory {String}
   *     The descriptive riskCategory value i.e. 'I', 'II', 'III', or 'IV'
   * @param s1 {Double}
   *     The S1 value for which to determine the design category.
   * @param sds {Double}
   *     Numeric seismic design value at 0.2 second spectral acceleration.
   * @param sd1 {Double}
   *     Numeric seismic design value at 1.0 second spectral acceleration.
   *
   * @return {Promise}
   *     A promise that will resolve with a string containing the correct
   *     design category.
   */
  _this.getDesignCategory = function (riskCategory, s1, sds, sd1) {
    var result,
        sdsCategory,
        sd1Category;

    return new Promise((resolve, reject) => {
      try {

        if (!sds) {
          throw new Error('"sds" is required to determine design category.');
        }

        if (!sd1) {
          throw new Error('"sd1" is required to determine design category.');
        }

        if (!riskCategory) {
          throw new Error('"risk category" is required to determine design ' +
              'category.');
        }

        if (riskCategory === 'N') {
          result = 'N';
        } else if (['I', 'II', 'III'].indexOf(riskCategory) !== -1 && s1 >= 0.75) {
          result = 'E';
        } else if (riskCategory === 'IV' && s1 >= 0.75) {
          result = 'F';
        } else {
          sdsCategory = _this.mapDesignCategory(riskCategory, 'sds', sds);
          sd1Category = _this.mapDesignCategory(riskCategory, 'sd1', sd1);

          result = (sdsCategory > sd1Category ? sdsCategory : sd1Category);
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Maps inputs to a single design category in DEFAULTS.lookupTables
   *
   * @param riskCategory {String}
   *     The descriptive riskCategory value i.e. 'I', 'II', 'III', or 'IV'
   * @param key {String}
   *     A key indicating either 'sds' or 'sd1' for mapping the correct lookup
   *     table (0.2s or 1.0s SA)
   * @param value {Double}
   *     The seismic design value at 0.2s or 1.0s spectral acceleration
   *
   * @return {String}
   *     The mapped design category
   */
  _this.mapDesignCategory = function (riskCategory, key, value) {
    var i,
        len,
        lookupTable;

    lookupTable = _this.lookupTables[key];

    for (i = 0, len = lookupTable.bins.length; i < len; i++ ) {
      if (value <= lookupTable.bins[i]) {
        return lookupTable.riskCategories[riskCategory][i - 1];
      }
    }

    return lookupTable.riskCategories[riskCategory][len - 1];
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = DesignCategoryFactory;
