'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  url: 'https://earthquake.usgs.gov/hazws/staticcurve/1/{EDITION}/{REGION}/{LONGITUDE}/{LATITUDE}/{IMT}/{VS30}'
};


/**
 * Factory for Unified Hazard Tool (UHT) static hazard curve data.
 *
 * @param options {Object}
 * @param options.url {String}
 *    UHT URL.
 */
var UHTHazardCurveFactory = function (options) {
  var _this,
      _initialize;

  _this = {};


  /**
   * Constructor.
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.url = options.url;
  };


  /**
   * Free factory resources.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };


  /**
   * Fetch curves for a location based on design edition.
   *
   * Uses design edition to determine
   *   - hazard edition
   *   - hazard region
   *   - grid spacing
   *
   * Then requests hazard curves for points surrounding request location.
   *
   * @param options {Object}
   * @param options.designEdition {String}
   * @param options.latitude {Number}
   * @param options.longitude {Number}
   * @return {Promise}
   */
  _this.getDesignCurves = function (/*options*/) {
    return Promise.reject('getDesignCurves not implemented');
  };


  /**
   * Fetch curves for a location based on hazard edition and region.
   *
   * @param gridSpacing {Number}
   * @param hazardEdition {String}
   * @param hazardRegion {String}
   * @param latitude {Number}
   * @param longitude {Number}
   * @return {Promise}
   */
  _this.getHazardCurves = function (/*options*/) {
    return Promise.reject('getHazardCurves not implemented');
  };


  /**
   * Given a gridSpacing, find the 1, 2, or 4 points
   * on grid that surround the specified location.
   *
   * @param gridSpacing {Number}
   * @param latitude {Number}
   * @param longitude {Number}
   *
   * @return {Array<Object>}
   *.    1, 2, or 4 points surrounding input location.
   */
  _this.getGridPoints = function (options) {
    var bottom,
        gridSpacing,
        latitude,
        left,
        longitude,
        points,
        right,
        top;

    gridSpacing = options.gridSpacing;
    latitude = options.latitude;
    longitude = options.longitude;
    points = [];

    top = Math.ceil(latitude / gridSpacing) * gridSpacing;
    left = Math.floor(longitude / gridSpacing) * gridSpacing;
    bottom = top - gridSpacing;
    right = left + gridSpacing;
    // handle floating point precision errors
    top = parseFloat(top.toPrecision(10));
    left = parseFloat(left.toPrecision(10));
    bottom = parseFloat(bottom.toPrecision(10));
    right = parseFloat(right.toPrecision(10));

    if (top === latitude && left === longitude) {
      // point is on grid
      points.push({
        latitude: top,
        longitude: left
      });
    } else if (left === longitude) {
      // point is on vertical line between two grid points
      points.push({
        latitude: top,
        longitude: left
      });
      points.push({
        latitude: bottom,
        longitude: left
      });
    } else if (top === latitude) {
      // point is on horizontal line between two grid points
      points.push({
        latitude: top,
        longitude: left
      });
      points.push({
        latitude: top,
        longitude: right
      });
    } else {
      points.push({
        latitude: top,
        longitude: left
      });
      points.push({
        latitude: top,
        longitude: right
      });
      points.push({
        latitude: bottom,
        longitude: right
      });
      points.push({
        latitude: bottom,
        longitude: left
      });
    }

    return points;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = UHTHazardCurveFactory;
