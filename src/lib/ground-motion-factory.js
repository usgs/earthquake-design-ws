'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils');


/**
 * Factory for performing linear interpolation of ground motion
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var GroundMotionFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instance of a GroundMotionFactory
   *
   * @param options {Object}
   *        options.util, a utility class that can perform spatial interpolation
   *
   */
  _initialize = function (options) {
    options = extend({}, options);

    _this.util = options.util || NumberUtils();
  };

  /**
   * Checks for required values and then performs spatial interpolation for
   * s1 and ss values.
   *
   * @param  {Array} points
   *         An ordered array of "point" objects:
   *         {
   *           'latitude': {Number},
   *           'longitude': {Number},
   *           's1': {Number},
   *           'ss': {Number}
   *         }
   * @param  {Number} latitude
   *         Latitude from reference point
   * @param  {Number} longitude
   *         Longitude from reference point
   *
   * @return {Object}
   *         Spatially interpolated point with interpolated s1 and ss values
   */
  _this.getGroundMotion = function (points, latitude, longitude) {
    var i,
        len;

    // loop over points and check for s1 and ss values
    for (i = 0, len = points.length; i < len; i++) {
      if (!points[i].hasOwnProperty('s1')) {
        throw new Error('Point (' + latitude + ', ' + longitude +
            ') is missing an "s1" value for interpolation');
      }
      if (!points[i].hasOwnProperty('ss')) {
        throw new Error('Point (' + latitude + ', ' + longitude +
            ') is missing an "ss" value for interpolation');
      }
    }

    // perform linear spatial interpolation
    return _this.util.spatialInterpolate(points, latitude, longitude,
        _this.util.INTERPOLATE_USING_LINEAR);
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


  _initialize(options);
  options = null;
  return _this;
};


module.exports = GroundMotionFactory;