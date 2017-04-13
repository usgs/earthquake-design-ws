'use strict';


var DesignHazardMetadata = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = options || {};

    if (options.hasOwnProperty('map')) {
      _this.map = options.map;
    } else {
      _this.map = {
        'ASCE41-13': [
          {
            'hazardEdition': 'E2008R2',
            'hazardRegion': 'COUS0P05',
            'minLatitude': 24.6,
            'maxLatitude': 50.0,
            'minLongitude': -125.0,
            'maxLongitude': -65.0,
            'gridSpacing': 0.05
          },
          {
            'hazardEdition': 'E2007R1',
            'hazardRegion': 'AK0P10',
            'minLatitude': 48.0,
            'maxLatitude': 72.0,
            'minLongitude': -200.0,
            'maxLongitude': -125.0,
            'gridSpacing': 0.10
          },
          {
            'hazardEdition': 'E2003R1',
            'hazardRegion': 'PRVI0P01',
            'minLatitude': 17.5,
            'maxLatitude': 19.0,
            'minLongitude': -67.5,
            'maxLongitude': -64.5,
            'gridSpacing': 0.01
          },
          {
            'hazardEdition': 'E1998R1',
            'hazardRegion': 'HI0P02',
            'minLatitude': 18.0,
            'maxLatitude': 23.0,
            'minLongitude': -161.0,
            'maxLongitude': -65.0,
            'gridSpacing': 0.02
          }
        ]
      };
    }
  };


  /**
   * Checks if the region contains the point identified by the given
   * latitude/longitude pair.
   *
   * @param region {Object}
   *     Object containing min/max latitude/longitude properties defining
   *     the bounds of a rectangular region.
   * @param latitude {Number}
   *     Latitude coordinate of point to check if region contains.
   * @param longitude {Number}
   *     Longitude coordinate of point to check if region contains.
   *
   * @return {Boolean}
   *     Truthy if the given region contains the point described by the given
   *     latitude/longitude pair; falsey otherwise.
   */
  _this.contains = function (region, latitude, longitude) {
    return (
      region.maxLatitude >= latitude &&
      region.minLatitude <= latitude &&
      region.maxLongitude >= longitude &&
      region.minLongitude <= longitude
    );
  };

  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  /**
   * Written as a promise so use need not change if/when this metadata is
   * fetched async from some web service metadata endpoint.
   *
   * @param params.referenceDocument {String}
   *     Design edition identifier.
   * @param params.latitude {Number}
   *     Decimal degrees latitude
   * @param params.longitude {Number}
   *     Decimal degrees longitude
   *
   * @return {Promise}
   *     A promise that will resolve with the corresponding hazard
   *     service metadata or will reject if an error occurs.
   */
  _this.getHazardMetadata = function (params) {
    var referenceDocument,
        i,
        latitude,
        longitude,
        region,
        regions;

    params = params || {};
    referenceDocument = params.referenceDocument;
    latitude = params.latitude;
    longitude = params.longitude;

    if (!_this.map.hasOwnProperty(referenceDocument)) {
      return Promise.reject(new Error('No mapping available for ' +
          referenceDocument));
    }

    regions = _this.map[referenceDocument];

    for (i = 0; i < regions.length; i++) {
      region = regions[i];

      if (_this.contains(region, latitude, longitude)) {
        return Promise.resolve(region);
      }
    }

    return Promise.reject(new Error('Mapping to hazard metadata failed!'));
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = DesignHazardMetadata;
