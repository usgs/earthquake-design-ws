'use strict';


const extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


const _DEFAULTS = {
  lookupTables: {
    'ASCE7-05': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.7, 1.6, 1.5, 1.4, 1.3],
          'D': [2.4, 2.0, 1.8, 1.6, 1.5],
          'E': [3.5, 3.2, 2.8, 2.4, 2.4]
        }
      }
    },
    'ASCE7-10': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.7, 1.6, 1.5, 1.4, 1.3],
          'D': [2.4, 2.0, 1.8, 1.6, 1.5],
          'E': [3.5, 3.2, 2.8, 2.4, 2.4]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      }
    },
    'NEHRP-2009': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.7, 1.6, 1.5, 1.4, 1.3],
          'D': [2.4, 2.0, 1.8, 1.6, 1.5],
          'E': [3.5, 3.2, 2.8, 2.4, 2.4]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      }
    },
    'ASCE7-16': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25, 1.50],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': null,
          'D-default': null,
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 1.00
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
          'D-default': [1.6, 1.4, 1.2, 1.2, 1.2, 1.2],
          'E': [2.4, 1.7, 1.3, 1.3, 1.3, 1.3]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'D-default': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.5, 1.5, 1.5, 1.5, 1.5, 1.4],
          'D': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'D-default': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'E': [4.2, 4.2, 4.2, 4.2, 4.2, 4.2]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.2, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.3, 1.2, 1.1, 1.1],
          'D-default': [1.6, 1.4, 1.3, 1.2, 1.2, 1.2],
          'E': [2.4, 1.9, 1.6, 1.4, 1.2, 1.1]
        }
      }
    },
    'ASCE41-13': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.2, 1.2, 1.1, 1.0, 1.0],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0],
          'E': [2.5, 1.7, 1.2, 0.9, 0.9]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50],
        restriction: {
          'A': null,
          'B': null,
          'C': null,
          'D': null,
          'E': null
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.7, 1.6, 1.5, 1.4, 1.3],
          'D': [2.4, 2.0, 1.8, 1.6, 1.5],
          'E': [3.5, 3.2, 2.8, 2.4, 2.4]
        }
      }
    },
    'ASCE41-17': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25, 1.50],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': null,
          'D-default': null,
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 1.00
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
          'D-default': [1.6, 1.4, 1.2, 1.2, 1.2, 1.2],
          'E': [2.4, 1.7, 1.3, 1.3, 1.3, 1.3]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'D-default': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.5, 1.5, 1.5, 1.5, 1.5, 1.4],
          'D': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'D-default': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'E': [4.2, 4.2, 4.2, 4.2, 4.2, 4.2]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.2, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.3, 1.2, 1.1, 1.1],
          'D-default': [1.6, 1.4, 1.3, 1.2, 1.2, 1.2],
          'E': [2.4, 1.9, 1.6, 1.4, 1.2, 1.1]
        }
      }
    },
    'NEHRP-2015': {
      'ss': {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25, 1.50],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': null,
          'D-default': null,
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 1.00
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
          'D-default': [1.6, 1.4, 1.2, 1.2, 1.2, 1.2],
          'E': [2.4, 1.7, 1.3, 1.3, 1.3, 1.3]
        }
      },
      's1': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'D-default': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          },
          'E': {
            'message': 'See Section 11.4.8',
            'limit': 0.20
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.5, 1.5, 1.5, 1.5, 1.5, 1.4],
          'D': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'D-default': [2.4, 2.2, 2.0, 1.9, 1.8, 1.7],
          'E': [4.2, 4.2, 4.2, 4.2, 4.2, 4.2]
        }
      },
      'pga': {
        bins: [0.10, 0.20, 0.30, 0.40, 0.50, 0.60],
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.2, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.3, 1.2, 1.1, 1.1],
          'D-default': [1.6, 1.4, 1.3, 1.2, 1.2, 1.2],
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
const SiteAmplificationFactory = function (options) {
  let _this,
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

    _initialize = null;
    _this = null;
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
   *     the result object will contain an `fa` value of `undefined`.
   * @param inputs.s1 {Double} Optional
   *     The S1 value for which to compute Fv. If no `s1` value is present,
   *     the result object will contain an `fv` value of `undefined`.
   * @param inputs.pga {Double} Optional
   *     The PGA value for which to compute Fpga. If no `pga` value is present,
   *     the result object will contain an `fpga` value of `undefined`.
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing
   *     the `fa`, `fv`, and `fpga` site amplification values.
   */
  _this.getSiteAmplificationData = function (inputs) {
    let data,
        lookupTable,
        referenceDocument,
        restriction,
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
          restriction = data.restriction[siteClass];

          result.fa = NumberUtils.interpolateBinnedValue(data.bins,
              data.siteClasses[siteClass], inputs.ss);

          if (restriction !== null && inputs.ss >= restriction.limit) {
            result.fa = null;
            result.fa_error = restriction.message;
          }
        }

        if (inputs.hasOwnProperty('s1')) {
          data = lookupTable.s1;
          restriction = data.restriction[siteClass];

          result.fv = NumberUtils.interpolateBinnedValue(data.bins,
              data.siteClasses[siteClass], inputs.s1);

          if (restriction !== null && inputs.s1 >= restriction.limit) {
            result.fv = null;
            result.fv_error = restriction.message;
          }
        }

        if (inputs.hasOwnProperty('pga')) {
          data = lookupTable.pga;
          result.fpga = NumberUtils.interpolateBinnedValue(data.bins,
              data.siteClasses[siteClass], inputs.pga);
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


module.exports = SiteAmplificationFactory;
