'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS,
    _MOCK_DB;

_MOCK_DB = {
  query: () => {
    var result;

    result = {
      rows: [{
        id: 9602302,
        region_id: 1,
        latitude: 35,
        longitude: -105,
        cr1: 1.0,
        crs: 1.0
      }]
    };

    return Promise.resolve(result);
  }
};

_DEFAULTS = {
  db: _MOCK_DB
};


var RiskTargetingCoefficientFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.db = options.db;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };


  /**
   * [getRiskTargetingData description]
   *
   * @param  {Object} inputs
   *         {
   *           'gridSpacing': grid spacing for region {Number},
   *           'latitude': latitude for refrence point {Number},
   *           'longitude': longitude of reference point {Number},
   *           'region': region id {Number}
   *         }
   *
   * @return {Object}
   *     An object containing cr1 and crs properties
   */
  _this.getRiskTargetingData = function (inputs) {
    var latitude,
        longitude;

    return _this.getGriddedData(inputs).then((grid) => {
      latitude = inputs.latitude;
      longitude = inputs.longitude;

      // spatially interpolate using reference point (latitude/longitude)
      return NumberUtils.spatialInterpolate(grid.points, latitude, longitude,
          NumberUtils.INTERPOLATE_USING_LINEAR);
    });
  };


  /**
   * Queries gridded data from database and returns 4, 2, or 1 point(s)
   *
   * @param  {Object} inputs
   *         {
   *           'gridSpacing': grid spacing for region {Number},
   *           'latitude': latitude for refrence point {Number},
   *           'longitude': longitude of reference point {Number},
   *           'region': region id {Number}
   *         }
   *
   * @return {Object}
   *     An object containing row(s) of "data" for the queried reference point
   */
  _this.getGriddedData = function (inputs) {
    var gridSpacing,
        latitude,
        longitude,
        region;

    gridSpacing = inputs.gridSpacing; // $4
    latitude = inputs.latitude;       // $2
    longitude = inputs.longitude;     // $3
    region = inputs.region;           // $1

    return _this.db.query(
        'SELECT * ' +
        'FROM   data ' +
        'WHERE  region_id = $1' +
        'AND    latitude  < ($2::Numeric + $4::Numeric) ' +
        'AND    latitude  > ($2::Numeric - $4::Numeric) ' +
        'AND    longitude < ($3::Numeric + $4::Numeric) ' +
        'AND    longitude > ($3::Numeric - $4::Numeric)',
      [
        region,
        latitude,
        longitude,
        gridSpacing
      ]
    ).then((result) => {
      return Promise.resolve({
        'points': result.rows
      });
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = RiskTargetingCoefficientFactory;
