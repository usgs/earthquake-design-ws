'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS,
    _METADATA,
    _REGIONS;

_DEFAULTS = {
  'metadata': _METADATA,
  'regions': _REGIONS
};

_METADATA = {
  'ASCE 41-13': [
    {
      'regions': [
        'COUS',
        'AK',
        'PRVI'
      ],
      'data': {
        'curve_interpolation_method': NumberUtils.INTERPOLATE_USING_LOG,
        'floor_pgad': 0.5,
        'floor_s1d': 0.6,
        'floor_ssd': 1.5,
        'max_direction_pgad': 1.0,
        'max_direction_s1d': 1.3,
        'max_direction_ssd': 1.1,
        'model_version': 'v3.1.x',
        'percentile_pgad': 1.8,
        'percentile_s1d': 1.8,
        'percentile_ssd': 1.8,
        'spatial_interpolation_method': NumberUtils.INTERPOLATE_USING_LINEAR,
      }
    },
    {
      'regions': [
        'HI'
      ],
      'data': {
        'curve_interpolation_method': NumberUtils.INTERPOLATE_USING_LINEAR,
        'floor_pgad': 0.5,
        'floor_s1d': 0.6,
        'floor_ssd': 1.5,
        'max_direction_pga': 1.0,
        'max_direction_s1': 1.0,
        'max_direction_ss': 1.0,
        'model_version': 'v3.1.x',
        'percentile_pga': 1.8,
        'percentile_s1': 1.8,
        'percentile_ss': 1.8,
        'spatial_interpolation_method': NumberUtils.INTERPOLATE_USING_LINEAR,
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
    'min_longitude': -200.0,
  },
  {
    'name': 'COUS',
    'max_latitude':    50.0,
    'max_longitude':  -65.0,
    'min_latitude':    24.6,
    'min_longitude': -125.0,
  },
  {
    'name': 'HI',
    'grid_spacing':    0.02,
    'max_latitude':    23.0,
    'max_longitude': -154.0,
    'min_latitude':    18.0,
    'min_longitude': -161.0,
  },
  {
    'name': 'PRVI',
    'max_latitude':   19.0,
    'max_longitude': -64.5,
    'min_latitude':   17.5,
    'min_longitude': -67.5,
  }
];

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
   * Get metadata related to inputs of referenceDocument,
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
    var referenceDocument,
        region;

    referenceDocument = inputs.referenceDocument;

    return _this.getRegion(inputs).then((result) => {
      region = result;
      return _this.getData(referenceDocument, region);
    }).then((result) => {
      return {
        'metadata': result
      };
    });
  };

  _this.getData = function (referenceDocument, region) {
    var metadata,
        result;

    // determine metadata set based on referenceDocument
    metadata = _this.metadata[referenceDocument];

    return new Promise((resolve, reject) => {
      try {
        // loop through metadata objects
        for (var i = 0; i < metadata[i].length; i++) {
          if (metadata[i].indexOf(region) !== -1) {
            result = metadata[i].data;
          }
        }
        // return metadata
        resolve(result);
      } catch (err) {
        reject(err);
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
  _this.getRegion = function (inputs) {
    var latitude,
        longitude,
        region;

    return new Promise((resolve, reject) => {
      // check that these values exist or will there be a handler that does this?
      latitude = inputs.latitude;
      longitude = inputs.longitude;

      // loop over regions and find the region that matches the input lat/lng
      for (var i = 0; i < _this.region.length; i++) {
        region = _this.region[i];

        if (latitude  <= region.max_latitude  &&
            latitude  >= region.min_latitude  &&
            longitude <= region.max_longitude &&
            longitude >= region.min_longitude) {
          resolve(region.name);
        }
      }

      reject(new Error('No metadata exists.'));
    });
  };


  _initialize(options);
  options = null;
  return _this;
};



module.exports = MetadataFactory;
