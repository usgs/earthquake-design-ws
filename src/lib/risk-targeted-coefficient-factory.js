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

  // TODO, use interpolated grid points to calculate risk targeted coefficient
  _this.calculateCoefficents = function(/*points*/) {
    return Promise.resolve({
      'crs': 1.0,
      'cr1': 1.0
    });
  };

  // TODO, return coefficient data
  _this.getCoefficentData = function (inputs) {
    return _this.getGridBounds(inputs).then((bounds) => {
      return _this.getGriddedData(bounds).then((grid) => {
        return _this.interpolate(inputs, grid).then((points) => {
          return _this.calculateCoefficents(points);
        });
      });
    });
  };

  // TODO, based on gridSpacing, latitude, and longitude find the bounds that will be used to return 4, 2, or 1 grid point(s)
  _this.getGridBounds = function (inputs) {
    var gridSpacing,
        latitude,
        longitude,
        maxLatitude,
        maxLongitude,
        minLatitude,
        minLongitude;

    gridSpacing = inputs.gridSpacing;
    latitude = inputs.latitude;
    longitude = inputs.longitude;

    maxLatitude = (latitude % gridSpacing === 0 ? latitude :
        latitude + gridSpacing);
    minLatitude = (latitude % gridSpacing === 0 ? latitude :
        latitude - gridSpacing);

    maxLongitude = (longitude % gridSpacing === 0 ? longitude :
        longitude + gridSpacing);
    minLongitude = (longitude % gridSpacing === 0 ? longitude :
        longitude - gridSpacing);


    return Promise.resolve({
      'maxLatitude': maxLatitude,
      'maxLongitude': maxLongitude,
      'minLatitude': minLatitude,
      'minLongitude': minLongitude
    });
  };

  // TODO, use _this.db to query gridded data from database and return 4, 2, or 1 point
  _this.getGriddedData = function (inputs, bounds) {
    var region;

    region = inputs.region;

    _this.db.query(
        'SELECT * ' +
        'FROM   data ' +
        'WHERE  region_id = $1' +
        'AND    latitude  <= $2 ' +
        'AND    latitude  >= $3 ' +
        'AND    longitude <= $4 ' +
        'AND    longitude >= $5', 
      [
        region,
        bounds.maxLatitude,
        bounds.minLatitude,
        bounds.maxLongitude,
        bounds.minLongitude
      ]
    ).then((result) => {
      return Promise.resolve({
        'points': result.rows
      });
    }).catch((err) => {
      throw new Error(err.message);
    });
  };

  // TODO, spatially interpolate the gridded points for the interpolated coefficient data
  _this.interpolate = function () {
    return Promise.resolve({
      'crs': 1.0,
      'cr1': 1.0
    });
  };



  /**
   * Interpolates between 4, 2, or 1-point(s)
   *
   * @param data {array}
   *        an object with up to four grided points and reference lat/lon
   *        {
   *          points: [
   *            {
   *              'latitude': {number},
   *              'longitude': {number},
   *              'ss': {number},
   *              's1': {number}
   *            },
   *            ...
   *          ],
   *          latitude: {number},
   *          longitude: {number}
   *       }
   *
   * @return {object}
   *         The interpolated ground motion
   */
  _this.interpolate = function (data) {
    var latitude,
        lat1,
        lat2,
        lat3,
        longitude,
        lng1,
        lng2,
        lng3,
        lng4,
        points,
        resultLat1,
        resultLat3,
        resultCRS,
        resultCR1;

    latitude = data.latitude;
    longitude = data.longitude;
    points = data.points;

    if (points.length === 1) {
      resultCRS = points[0].crs;
      resultCR1 = points[0].cr1;

    } else if (points.length === 2) {
      lat1 = points[0].latitude;
      lat2 = points[1].latitude;
      lng1 = points[0].longitude;
      lng2 = points[1].longitude;

      if (lat1 === lat2) {
        // interpolate for ss
        resultCRS = _this.interpolateValue(
            lng1,
            lng2,
            points[0].crs,
            points[1].crs,
            longitude);

        // interpolate for s1
        resultCR1 = _this.interpolateValue(
            lng1,
            lng2,
            points[0].cr1,
            points[1].cr1,
            longitude);

      } else if (lng1 === lng2) {
        // interpolate for ss
        resultCRS = _this.interpolateValue(
            lat1,
            lat2,
            points[0].crs,
            points[1].crs,
            latitude);

        // interpolate for s1
        resultCR1 = _this.interpolateValue(
            lat1,
            lat2,
            points[0].cr1,
            points[1].cr1,
            latitude);

      } else {
        throw new Error('Lat or Lng don\'t match and only 2 data points');
      }
    } else if (points.length === 4) {
      lat1 = points[0].latitude;
      lat3 = points[2].latitude;

      lng1 = points[0].longitude;
      lng2 = points[1].longitude;
      lng3 = points[2].longitude;
      lng4 = points[3].longitude;

      // interpolate for ss
      resultLat1 = _this.interpolateValue(
          lng1,
          lng2,
          points[0].crs,
          points[1].crs,
          longitude);

      resultLat3 = _this.interpolateValue(
          lng3,
          lng4,
          points[2].crs,
          points[3].crs,
          longitude);

      resultCRS = _this.interpolateValue(
          lat1,
          lat3,
          resultLat1,
          resultLat3,
          latitude);

      // interpolate for s1
      resultLat1 = _this.interpolateValue(
          lng1,
          lng2,
          points[0].cr1,
          points[1].cr1,
          longitude);

      resultLat3 = _this.interpolateValue(
          lng3,
          lng4,
          points[2].cr1,
          points[3].cr1,
          longitude);

      resultCR1 = _this.interpolateValue(
          lat1,
          lat3,
          resultLat1,
          resultLat3,
          latitude);

    } else {
      throw new Error('Does not have 1, 2, or 4 points.');
    }

    return Promise.resolve({
      'latitude': latitude,
      'longitude': longitude,
      'crs': resultCRS,
      'cr1': resultCR1
    });
  };

  /**
   * Performs generic linear interpolation.
   *
   * @param xmin {Double}
   *     The lower x-value
   * @param xmax {Double}
   *     The upper x-value
   * @param ymin {Double}
   *     The lower y-value
   * @param ymax {Double}
   *     The upper y-value
   * @param x {Double}
   *     The target x-value
   *
   * @return {Double}
   *     The interpolated y-value corresponding to the input target x-value.
   */
  _this.interpolateValue = function (xmin, xmax, ymin, ymax, x) {
    return ymin + ((x - xmin) * ((ymax - ymin) / (xmax - xmin)));
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = RiskTargetedCoefficientFactory;
