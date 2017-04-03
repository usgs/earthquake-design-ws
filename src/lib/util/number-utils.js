'use strict';


var extend = require('extend');


var _DEFAULTS,
    _INTERPOLATE_USING_LINEAR,
    _INTERPOLATE_USING_LOG;

_DEFAULTS = {
  roundPrecision: 3,
  epsilon: 1E-10,
};

_INTERPOLATE_USING_LINEAR = 'linear';
_INTERPOLATE_USING_LOG = 'log';


var NumberUtils = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.roundPrecision = options.roundPrecision;
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

  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  _this.interpolate = function (y0, y1, x, x0, x1, method) {
    var value;

    if (typeof method === 'undefined') {
      method = _INTERPOLATE_USING_LINEAR;
    }

    if (x0 === y0 && x1 === y1) {
      return x;
    }

    if (method === _INTERPOLATE_USING_LOG) {
      if (y0 <= 0 || y1 <= 0) {
        throw new Error('Can not perform log interpolation values <= 0.');
      } else {
        y0 = Math.log(y0);
        y1 = Math.log(y1);

        value = Math.exp(y0 + (((y1-y0)/(x1-x0))*(x-x0)));
      }
    } else {
      value = y0 + (((y1-y0)/(x1-x0))*(x-x0));
    }

    return value;
  };

  _this.interpolateObject = function (obj0, obj1, x, x0, x1, method) {
    var key,
        result;

    for (key in obj0) {
      if (obj0.hasOwnProperty(key) && obj1.hasOwnProperty(key)) {
        result[key] = _this.interpolate(obj0[key], obj1[key],
            x, x0, x1, method);
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
   */
  _this.round = function (value, precision) {
    var factor,
        rounded;

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
      if (_this.closeTo(points[0].latitude, latitude)) {
        // Latitudes match, interpolate longitudes
        return _this.interpolateObject(
          points[0],
          points[1],
          longitude,
          points[0].longitude,
          points[1].longitude,
          method
        );
      } else if (_this.closeTo(points[0].longitude, longitude)) {
        // Longitudes match, interpolate latitudes
        return _this.interpolateObject(
          points[0],
          points[1],
          latitude,
          points[0].latitude,
          points[1].latitude,
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
        points[0],
        points[1],
        longitude,
        points[0].longitude,
        points[1].longitude,
        method
      );

      // Interpolate bottom two with respect to longitude
      bot = _this.interpolateObject(
        points[2],
        points[3],
        longitude,
        points[2].longitude,
        points[3].longitude,
        method
      );

      // Interpolate top/bot results with respect to latitude
      return _this.interpolateObject(
        top,
        bot,
        latitude,
        top.latitude,
        bot.latitude,
        method
      );
    } else {
      throw new Error('Spatial interpolation failed. Enexpected number of ' +
          'points.');
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


NumberUtils.instance = NumberUtils();

// Some constants
NumberUtils.INTERPOLATE_USING_LINEAR = _INTERPOLATE_USING_LINEAR;
NumberUtils.INTERPOLATE_USING_LOG = _INTERPOLATE_USING_LOG;


module.exports = NumberUtils;
