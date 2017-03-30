'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {

};


var RiskTargetedCoefficientFactory = function (options) {
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

  // TODO, return coefficient data
  _this.getCoefficentData = function (inputs) {
    return _this.getGridBounds(inputs).then((bounds) => {
      return _this.getGriddedData(inputs, bounds).then((grid) => {
        return _this.interpolate(inputs, grid);
      });
    });
  };

  // TODO, based on gridSpacing, latitude, and longitude find the bounds that will be used to return 4, 2, or 1 grid point(s)
  _this.getGridBounds = function (/*inputs*/) {
    return Promise.resolve({
      'bounds': {
        'maxLatitude': 35.06,
        'maxLongitude': -105.06,
        'minLatitude': 34.96,
        'minLongitude': -105.16
      },
      'latitude': 35.01,
      'longitude': -105.11
    });
  };

  // TODO, use _this.db to query gridded data from database and return 4, 2, or 1 point
  _this.getGriddedData = function (/*inputs, bounds*/) {
    return Promise.resolve({
      'points': [
        {
          'latitude': 35.05,
          'longitude': -105.15,
          'cr1': 1.0,
          'crs': 1.0
        },
        {
          'latitude': 35.05,
          'longitude': -105.10,
          'cr1': 1.0,
          'crs': 1.0
        },
        {
          'latitude': 35.00,
          'longitude': -105.15,
          'cr1': 1.0,
          'crs': 1.0
        },
        {
          'latitude': 35.00,
          'longitude': -105.10,
          'cr1': 1.0,
          'crs': 1.0
        }
      ],
      'latitude': 35.01,
      'longitude': -105.11
    });
  };

  // TODO, spatially interpolate the gridded points for the interpolated coefficient data
  _this.interpolate = function () {
    return Promise.resolve({
      'crs': 1.0,
      'cr1': 1.0
    });
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = RiskTargetedCoefficientFactory;
