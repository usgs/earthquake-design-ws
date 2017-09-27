'use strict';


const extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


const _METADATA = {
  'ASCE7-05': [
    {
      'regions': [
        'AK0P10',
        'CANV0P01',
        'CEUS0P01',
        'HI0P02',
        'PACNW0P01',
        'PRVI0P05',
        'SLC0P01',
        'US0P05'
      ],
      'data': {
        'modelVersion': 'v2.0.x',
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR
      }
    }
  ],

  'ASCE7-10': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
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
        'HI0P02'
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
        'COUS0P01',
        'AK0P05',
        'PRVI0P01'
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
        'HI0P02'
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
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10'
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
        'AK0P05',
        'PRVI0P01'
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
        'HI0P02'
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
        'AK0P05',
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10',
        'PRVI0P01'
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
        'HI0P02'
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
  ],

  'IBC-2012': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
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
        'HI0P02'
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

  'IBC-2015': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
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
        'HI0P02'
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

  'NEHRP-2009': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
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
        'HI0P02'
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

  'NEHRP-2015': [
    // LogY interpolation, standard factors
    {
      'regions': [
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10'
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
        'AK0P05',
        'PRVI0P01'
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
        'HI0P02'
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
  ]
};

const _REGIONS = [
  {
    'name': 'AK0P05',
    'max_latitude':    72.0,
    'max_longitude': -125.1,
    'min_latitude':    48.0,
    'min_longitude': -200.0
  },
  {
    'name': 'AK0P10',
    'max_latitude':    72.0,
    'max_longitude': -130.0,
    'min_latitude':    50.0,
    'min_longitude': -190.0,
  },
  {
    'name': 'AMSAM0P10',
    'max_latitude':   -11.0,
    'max_longitude': -165.0,
    'min_latitude':   -33.0,
    'min_longitude': -195.0
  },
  {
    'name': 'CANV0P01',
    'max_latitude':    42.0,
    'max_longitude': -115.0,
    'min_latitude':    32.0,
    'min_longitude': -125.0,
  },
  {
    'name': 'CEUS0P01',
    'max_latitude':   38.0,
    'max_longitude': -88.0,
    'min_latitude':   35.0,
    'min_longitude': -92.0,
  },
  {
    'name': 'COUS0P01',
    'max_latitude':    50.0,
    'max_longitude':  -65.0,
    'min_latitude':    24.6,
    'min_longitude': -125.0
  },
  {
    'name': 'GNMI0P10',
    'max_latitude':   23.0,
    'max_longitude': 151.0,
    'min_latitude':    9.0,
    'min_longitude': 139.0
  },
  {
    'name': 'HI0P02',
    'max_latitude':    23.0,
    'max_longitude': -154.0,
    'min_latitude':    18.0,
    'min_longitude': -161.0
  },
  {
    'name': 'PACNW0P01',
    'max_latitude':    49.0,
    'max_longitude': -123.0,
    'min_latitude':    41.0,
    'min_longitude': -125.0,
  },
  {
    'name': 'PRVI0P01',
    'max_latitude':   19.0,
    'max_longitude': -64.5,
    'min_latitude':   17.5,
    'min_longitude': -67.5
  },
  {
    'name': 'PRVI0P05',
    'max_latitude':   21.0,
    'max_longitude': -62.0,
    'min_latitude':   16.0,
    'min_longitude': -70.0,
  },
  {
    'name': 'SLC0P01',
    'max_latitude':    45.0,
    'max_longitude': -110.0,
    'min_latitude':    40.0,
    'min_longitude': -112.0,
  },
  {
    'name': 'US0P05',
    'max_latitude':    50.0,
    'max_longitude':  -65.0,
    'min_latitude':    24.6,
    'min_longitude': -125.0,
  }
];

const _DEFAULTS = {
  'metadata': _METADATA,
  'regions': _REGIONS
};


const MetadataFactory = function (options) {
  let _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.regions = options.regions;
    _this.metadata = options.metadata;
  };


  /**
   * computes the size of a region.
   * @param inputs {object}
   *        region.max_latitude {number}
   *        region.min_latitude {number}
   *        region.max_longitude {number}
   *        region.min_longitude {number}
   * @return {number}
   *        The area of the given extents.
   */
  _this._computeRegionArea = function (region) {
    let area,
        height,
        width;

    height = Math.abs(region.max_latitude - region.min_latitude);
    width = Math.abs(region.max_longitude - region.min_longitude);
    area = width * height;

    return area;
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
    let region;

    // validate inputs
    return _this.checkParams(inputs).then(() => {
      return _this.getRegion(inputs.latitude, inputs.longitude,
          inputs.referenceDocument);
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
    let latitude,
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
    let metadata,
        result;

    return new Promise((resolve, reject) => {
      // determine metadata set based on referenceDocument
      try {
        metadata = _this.metadata[referenceDocument];
        // loop through metadata objects
        for (let i = 0; i < metadata.length; i++) {
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
  _this.getRegion = function (latitude, longitude, referenceDocument) {
    let documentRegions,
        region,
        regions;

    regions = [];
    documentRegions = [];

    return new Promise((resolve, reject) => {
      _this.metadata[referenceDocument].forEach((item) => {
        documentRegions = documentRegions.concat(item.regions);
      });

      // loop over regions and find the region that matches the input lat/lng
      for (let i = 0; i < _this.regions.length; i++) {
        region = _this.regions[i];

        if (documentRegions.indexOf(region.name) !== -1 &&
            latitude  <= region.max_latitude  &&
            latitude  >= region.min_latitude  &&
            longitude <= region.max_longitude &&
            longitude >= region.min_longitude) {
          // regions.push(region.name);
          regions.push(region);
        }
      }

      // if more than one region is found then use the smallest region
      if (regions.length > 1) {
        // sort region by size
        regions.sort((a, b) => {
          let aArea,
              bArea;

          aArea = _this._computeRegionArea(a);
          bArea = _this._computeRegionArea(b);

          return aArea - bArea;
        });
      }

      if (regions.length !== 0) {
        //resolve(regions);
        resolve(regions[0].name);
      }

      reject(new Error('No metadata exists. ' + latitude + ' ' + longitude + ' ' + referenceDocument));
    });
  };


  _initialize(options);
  options = null;
  return _this;
};



module.exports = MetadataFactory;
