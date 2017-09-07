'use strict';


var extend = require('extend');


var _DEFAULTS,
    _INTERPOLATE_LINEARX_LINEARY_LINEAR,
    _INTERPOLATE_LINEARX_LOGY_LINEAR,
    _INTERPOLATE_LOGX_LOGY_LINEAR;

_DEFAULTS = {
  epsilon: 1E-10,
  roundPrecision: 3
};

// x-space_y-space_method
_INTERPOLATE_LINEARX_LINEARY_LINEAR = 'linearlinearlinear';
_INTERPOLATE_LINEARX_LOGY_LINEAR = 'linearloglinear';
_INTERPOLATE_LOGX_LOGY_LINEAR = 'logloglinear';


var NumberUtils = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.epsilon = options.epsilon;
    _this.roundPrecision = options.roundPrecision;

    // Expose these on the instance as well
    _this.INTERPOLATE_LINEARX_LINEARY_LINEAR = _INTERPOLATE_LINEARX_LINEARY_LINEAR;
    _this.INTERPOLATE_LINEARX_LOGY_LINEAR = _INTERPOLATE_LINEARX_LOGY_LINEAR;
    _this.INTERPOLATE_LOGX_LOGY_LINEAR = _INTERPOLATE_LOGX_LOGY_LINEAR;
  };


  /**
   * Checks if the given `value` is "close to" the `target` within (inclusive)
   * the range epsilon.
   *
   * @param value {Number}
   *     The value to check.
   * @param target {Number}
   *     The target to which `value` should be close.
   * @param epsilon {Number}
   *     The tolerance within which `value` must be close to (inclusive)
   *     `target`.
   *
   * @return {Boolean}
   *     True if `value` is within (inclusive) `epsilon` of `target`, false
   *     otherwise.
   */
  _this.closeTo = function (value, target, epsilon) {
    if (typeof epsilon === 'undefined') {
      epsilon = _this.epsilon;
    }

    value = parseFloat(value);
    target = parseFloat(target);
    epsilon = parseFloat(epsilon);

    return (Math.abs(value - target) <= epsilon);
  };

  /**
   * Frees resources associated with this instance.
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
    latitude = parseFloat(options.latitude);
    longitude = parseFloat(options.longitude);

    top = Math.ceil(latitude / gridSpacing) * gridSpacing;
    left = Math.floor(longitude / gridSpacing) * gridSpacing;
    bottom = Math.floor(latitude / gridSpacing) * gridSpacing;
    right = Math.ceil(longitude / gridSpacing) * gridSpacing;
    // handle floating point precision errors
    top = parseFloat(top.toPrecision(10));
    left = parseFloat(left.toPrecision(10));
    bottom = parseFloat(bottom.toPrecision(10));
    right = parseFloat(right.toPrecision(10));

    if (top === latitude && left === longitude) {
      // point is on grid
      points = [
        {
          latitude: top,
          longitude: left
        }
      ];
    } else if (left === longitude) {
      // point is on vertical line between two grid points
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: bottom,
          longitude: left
        }
      ];
    } else if (top === latitude) {
      // point is on horizontal line between two grid points
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: top,
          longitude: right
        }
      ];
    } else {
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: top,
          longitude: right
        },
        {
          latitude: bottom,
          longitude: left
        },
        {
          latitude: bottom,
          longitude: right
        }
      ];
    }

    return points;
  };

  /**
   * Performs linear interpolation for between (x0, y0) and (x1, y1) to obtain
   * (x, y) where y is unknown. More verbosely; if the linear (potentially in
   * logarithmic space) function f is defined such that
   *   f(x0) = y0
   *   f(x1) = y1
   * then given
   *   x0 <= x <= x1
   * find y such that
   *   f(x) = y
   *
   *
   * @param x0 {Number}
   *     The x-coordinate of the first grid point to interpolate between.
   * @param y0 {Number}
   *     The y-coordinate of the first grid point to interpolate between.
   * @param x1 {Number}
   *     The x-coordinate of the second grid point to interpolate between.
   * @param y1 {Number}
   *     The y-coordinate of the second grid point to interpolate between.
   * @param x {Number}
   *     The x-coordinate of the point of interest.
   * @param method {String}
   *     Flag indicating interpolation method to use. Strictly speaking the
   *     method is always linear, but may be performed in logarithmic space
   *     if so indicated.
   *
   *
   * @return {Number}
   *     The y value such that f(x) = y
   *
   * @see NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR
   * @see NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR
   * @see NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR
   */
  _this.interpolate = function (x0, y0, x1, y1, x, method) {
    var value;

    if (typeof method === 'undefined') {
      method = _INTERPOLATE_LINEARX_LINEARY_LINEAR;
    }

    if (x0 === y0 && x1 === y1) {
      return x;
    }

    if (method === _INTERPOLATE_LOGX_LOGY_LINEAR) {
      if (y0 <= 0 || y1 <= 0) {
        throw new Error('Can not perform log interpolation values <= 0.');
      } else {
        x = Math.log(x);
        x0 = Math.log(x0);
        x1 = Math.log(x1);
        y0 = Math.log(y0);
        y1 = Math.log(y1);

        value = Math.exp(y0 + (((y1-y0)/(x1-x0))*(x-x0)));
      }
    } else if (method === _INTERPOLATE_LINEARX_LOGY_LINEAR) {
      // TODO
      throw new Error('Interpolation method linearloglinear not implemented!');
    } else if (method === _INTERPOLATE_LINEARX_LINEARY_LINEAR) {
      value = y0 + (((y1-y0)/(x1-x0))*(x-x0));
    }

    return value;
  };

  /**
   * Loops over each key in the object and interpolates to find the target
   * value for that key. Note that only keys common between `obj1` and `obj1`
   * will appear in the result.
   *
   * @param x0 {Number}
   *     The x-coordinate of the first grid point to interpolate between.
   * @param obj0 {Object}
   *     An object with numeric-valued properties upon which interpolation
   *     ought be performed. These values define the `y0` values for
   *     interpolation.
   * @param x1 {Number}
   *     The x-coordinate of the second grid point to interpolate between.
   * @param obj1 {Object}
   *     An object with numeric-valued properties upon which interpolation
   *     ought be performed. These values define the `y1` values for
   *     interpolation.
   * @param x {Number}
   *     The x-coordinate of the point of interest.
   * @param method {String}
   *     Flag indicating interpolation method to use. Strictly speaking the
   *     method is always linear, but may be performed in logarithmic space
   *     if so indicated.
   *
   *
   * @return {Object}
   *     An object with keys common to both `obj1` and `obj2` with corresponding
   *     properties equal to the interpolated result between `obj1` and `obj2`.
   *
   * @see NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR
   * @see NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR
   * @see NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR
   */
  _this.interpolateObject = function (x0, obj0, x1, obj1, x, method) {
    var key,
        result;

    result = {};

    for (key in obj0) {
      if (obj0.hasOwnProperty(key) && obj1.hasOwnProperty(key)) {
        result[key] = _this.interpolate(x0, obj0[key], x1, obj1[key],
            x, method);
      }
    }

    return result;
  };

  /**
   * Rounds the given `value` to the given `precision` number of decimals.
   *
   * Note this uses JS rounding logic such that 0.5 values round towards
   * +Inf rather than away from 0.
   *
   * Note this only considers the `precision + 1` decimal value for rounding
   * and does not deal with any additional decimals for rounding. For example:
   *     roundOutput(1.450, 1) --> 1.5
   *     roundOutput(1.449, 1) --> 1.4
   *
   *
   * @param value {Decimal}
   *     The value to be rounded.
   * @param precision {Integer}
   *     The number of decimals to include in the rounded result.
   *
   * @return {Decimal}
   *     The rounded result.
   *     If value is null returns null.
   */
  _this.round = function (value, precision) {
    var factor,
        rounded;

    if (value === null) {
      return null;
    }

    if (typeof precision === 'undefined') {
      precision = _this.roundPrecision;
    }

    factor = Math.pow(10, precision);

    if (precision < 1) {
      rounded = Math.round(factor);
    } else {
      factor = Math.pow(10, precision);
      rounded = Math.round(value * factor) / factor;
    }

    return rounded;
  };

  /**
   * Rounds the given `spectrum` values to the given `precision` number of
   * decimals.
   *
   * @param spectrum {Array}
   *     An array containing [x, y] data entries defininig the spectrum.
   * @param precision {Integer}
   *     The number of decimals to include in the rounded result entries.
   *
   * @return {Array}
   *     An array containing a spectrum where each entry value is rounded to
   *     the given precision.
   */
  _this.roundSpectrum = function (spectrum, precision) {
    return spectrum.map((entry) => {
      return [
        _this.round(entry[0], precision),
        _this.round(entry[1], precision)
      ];
    });
  };


  /**
   * Performs bi-linear spatial interpolation on the "point-object"s in the given
   * array of `points`. Each "point-object" must have at least a "latitude" and
   * "longitude" property. Any additional properties must be numeric.
   *
   * Interpolation proceeds as follows:
   * if 1-point ...
   *   return that point
   * if 2-points
   *   if latitudes match
   *     return interpolation with respect to longitude
   *   if longitudes match
   *     return interpolation with respect to latitude
   * if 4-points
   *   interpolate first-two points with respect to longitude
   *   interpolate second-two points with respect to longitude
   *   return interpolation of previous-two results with repect to latitude
   *
   * Note: Points must be ordered top-left to bottom right "typewriter" style.
   *
   * @param points {Array}
   *     An _ordered_ array of point-objects.
   * @param latitude {Number}
   *     The latitude coordinate for the point of interest.
   * @param longitude {Number}
   *     The longitude coordinate for the point of interest.
   * @param method {String}
   *     Flag indicating interpolation method to use. Strictly speaking the
   *     method is always linear, but may be performed in logarithmic space
   *     if so indicated.
   *
   * @return {Object}
   *     A point-object whose property values are the bi-linear interpolated
   *     result of the given `points` array for the target `latitude` and
   *     `longitude` coordinate.
   */
  _this.spatialInterpolate = function (points, latitude, longitude, method) {
    var bot,
        botLat,
        leftLng,
        rightLng,
        top,
        topLat;

    if (points.length === 1) {
      if (_this.closeTo(points[0].latitude, latitude) &&
          _this.closeTo(points[0].longitude, longitude)) {
        return points[0];
      } else {
        throw new Error('Only one point given and not the target point.');
      }
    } else if (points.length === 2) {
      if (_this.closeTo(points[0].latitude, latitude) &&
          _this.closeTo(points[0].latitude, points[1].latitude)) {
        // Latitudes match, interpolate longitudes
        return _this.interpolateObject(
            points[0].longitude,
            points[0],
            points[1].longitude,
            points[1],
            longitude,
            method
          );
      } else if (_this.closeTo(points[0].longitude, longitude) &&
          _this.closeTo(points[0].longitude, points[1].longitude)) {
        // Longitudes match, interpolate latitudes
        return _this.interpolateObject(
            points[0].latitude,
            points[0],
            points[1].latitude,
            points[1],
            latitude,
            method
          );
      } else {
        throw new Error('Two-point interpolation failed. Neither latitude ' +
            'nor longitude matched.');
      }
    } else if (points.length === 4) {
      topLat = points[0].latitude;
      botLat = points[2].latitude;
      leftLng = points[0].longitude;
      rightLng = points[1].longitude;

      // Sanity checks
      if (!_this.closeTo(topLat, points[1].latitude)) {
        throw new Error('Four-point interpolation failed. Top latitudes ' +
            'did not match.');
      }

      if (!_this.closeTo(botLat, points[3].latitude)) {
        throw new Error('Four-point interpolation failed. Bottom latitudes ' +
            'did not match.');
      }

      if (!_this.closeTo(leftLng, points[2].longitude)) {
        throw new Error('Four-point interpolation failed. Left longitudes ' +
            'did not match.');
      }

      if (!_this.closeTo(rightLng, points[3].longitude)) {
        throw new Error('Four-point interpolation failed. Right longitudes ' +
            'did not match.');
      }

      // Interpolate top two with respect to longitude
      top = _this.interpolateObject(
          points[0].longitude,
          points[0],
          points[1].longitude,
          points[1],
          longitude,
          method
        );

      // Interpolate bottom two with respect to longitude
      bot = _this.interpolateObject(
          points[2].longitude,
          points[2],
          points[3].longitude,
          points[3],
          longitude,
          method
        );

      // Interpolate top/bot results with respect to latitude
      return _this.interpolateObject(
          top.latitude,
          top,
          bot.latitude,
          bot,
          latitude,
          method
        );
    } else {
      throw new Error('Spatial interpolation failed. Unexpected number of ' +
          'points.');
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


NumberUtils.instance = NumberUtils();

// Some constants
NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR = _INTERPOLATE_LINEARX_LINEARY_LINEAR;
NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR = _INTERPOLATE_LINEARX_LOGY_LINEAR;
NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR = _INTERPOLATE_LOGX_LOGY_LINEAR;


module.exports = NumberUtils;
