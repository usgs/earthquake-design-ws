'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS,
    _METADATA,
    _REGIONS;

_METADATA = {
  'ASCE7-10': [
    {
      'regions': [
        'AK',
        'COUS',
        'PRVI'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE41-13': [
    {
      'regions': [
        'COUS',
        'AK',
        'PRVI'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR,
        'modelVersion': 'v3.1.x',
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'modelVersion': 'v3.1.x',
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE7-16': [
    // LogY interpolation, standard factors
    {
      'regions': [
        'AMSAM',
        'COUS',
        'GNMI'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, standard factors
    {
      'regions': [
        'AK',
        'PRVI'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, custom factors
    {
      'regions': [
        'HI'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLTE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE41-17': [
    {
      'regions': [
        'AK',
        'AMSAM',
        'COUS',
        'GNMI',
        'PRVI'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR,
        'modelVersion': 'v4.0.x',
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'modelVersion': 'v4.0.x',
        's1MaxDirFactor': 1.0,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ]
};

_REGIONS = [
  {
    'name': 'AK',
    'max_latitude':    72.0,
    'max_longitude': -125.1,
    'min_latitude':    48.0,
    'min_longitude': -200.0
  },
  {
    'name': 'AMSAM',
    'max_latitude':   -11.0,
    'max_longitude': -165.0,
    'min_latitude':   -33.0,
    'min_longitude': -195.0
  },
  {
    'name': 'COUS',
    'max_latitude':    50.0,
    'max_longitude':  -65.0,
    'min_latitude':    24.6,
    'min_longitude': -125.0
  },
  {
    'name': 'GNMI',
    'max_latitude':   23.0,
    'max_longitude': 151.0,
    'min_latitude':    9.0,
    'min_longitude': 139.0
  },
  {
    'name': 'HI',
    'max_latitude':    23.0,
    'max_longitude': -154.0,
    'min_latitude':    18.0,
    'min_longitude': -161.0
  },
  {
    'name': 'PRVI',
    'max_latitude':   19.0,
    'max_longitude': -64.5,
    'min_latitude':   17.5,
    'min_longitude': -67.5
  }
];

_DEFAULTS = {
  'metadata': _METADATA,
  'regions': _REGIONS
};


var MetadataFactory = function (options) {
  var _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.regions = options.regions;
    _this.metadata = options.metadata;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };


  /**
   * Get metadata associated with inputs of referenceDocument,
   * latitude, and longitude
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *     inputs.referenceDocument {String}
   *
   * @return {Promise}
   *     A promise that resolves with probabilistic metadata or rejects if an
   *     error occurs.
   */
  _this.getMetadata = function (inputs) {
    var region;

    // validate inputs
    return _this.checkParams(inputs).then(() => {
      return _this.getRegion(inputs.latitude, inputs.longitude);
    }).then((result) => {
      region = result;
      return _this.getData(inputs.referenceDocument, region);
    });
  };

  /**
   * Check input parameters to make sure latitude, longitude, and
   * referenceDocument are all provided
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *     inputs.referenceDocument {String}
   *
   * @return {Promise}
   *    A promise that resolves with inputs or rejects if an
   *    error occurs.
   */
  _this.checkParams = function (inputs) {
    var latitude,
        longitude,
        referenceDocument;

    return new Promise((resolve, reject) => {
      try {
        latitude = inputs.latitude;
        longitude = inputs.longitude;
        referenceDocument = inputs.referenceDocument;

        if (typeof latitude === 'undefined' || latitude === null) {
          throw new Error('"latitude" is required to determine metadata.');
        }

        if (typeof longitude === 'undefined' || longitude === null) {
          throw new Error('"longitude" is required to determine metadata.');
        }

        if (typeof referenceDocument === 'undefined' ||
            referenceDocument === null) {
          throw new Error('"referenceDocument" is required to determine metadata.');
        }

        return resolve(inputs);
      } catch (e) {
        return reject(e);
      }
    });
  };

  _this.getData = function (referenceDocument, region) {
    var metadata,
        result;

    return new Promise((resolve, reject) => {
      // determine metadata set based on referenceDocument
      try {
        metadata = _this.metadata[referenceDocument];
        // loop through metadata objects
        for (var i = 0; i < metadata.length; i++) {
          if (metadata[i].regions.indexOf(region) !== -1) {
            result = metadata[i].data;
          }
        }

        // return metadata
        return resolve(result);
      } catch (err) {
        return reject(err);
      }
    });
  };

  /**
   * Gets name of particular region based on the location
   * specified by `inputs.latitude` and `inputs.longitude`.
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *
   * @return {String}
   *     The name of the region that contains the lat/lng reference point
   */
  _this.getRegion = function (latitude, longitude) {
    var region;

    return new Promise((resolve, reject) => {
      // loop over regions and find the region that matches the input lat/lng
      for (var i = 0; i < _this.regions.length; i++) {
        region = _this.regions[i];

        if (latitude  <= region.max_latitude  &&
            latitude  >= region.min_latitude  &&
            longitude <= region.max_longitude &&
            longitude >= region.min_longitude) {
          return resolve(region.name);
        }
      }

      return reject(new Error('No metadata exists.'));
    });
  };


  _initialize(options);
  options = null;
  return _this;
};



module.exports = MetadataFactory;
