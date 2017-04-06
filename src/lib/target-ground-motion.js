'use strict';

var extend = require('extend'),
    NumberUtils = require('./util/number-utils');

var TargetGroundMotion = function (options) {
  var _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    options = extend({}, options);

    _this.numberUtils = options.NumberUtils || NumberUtils();
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _this = null;
    _initialize = null;
  };

  /**
   * Finds bounds on a curve of a given afe value.
   *
   * @param curve {array}
   *    array of [x, y] value pairs
   *
   * @param afe {number}
   *    Annual frequency of exceedance
   */
  _this.findBounds = function (curve, afe) {
    var bounds,
        found,
        i,
        len,
        x1,
        x2,
        y1,
        y2;

    found = false;

    for (i = 0, len = curve.length; i < len; i++) {
      x1 = curve[i][0];
      x2 = curve[(i + 1)][0];
      y1 = curve[i][1];
      y2 = curve[(i + 1)][1];

      if ((afe <= y1 && afe >= y2) || (afe >= y1 && afe <= y2)) {
        bounds = [[x1, y1],[x2, y2]];
        found = true;

        break;
      }
    }

    if (!found){
      throw Error('AFE Value (' + afe + ') must be within the range: ' +
          curve[0] + ' and ' + curve[(curve.length - 1)]);
    }

    return bounds;
  };

  /**
   * Uses the given probability to compute afe (Annual frequency of exceedance)
   * @param probability {number}
   *    Custom probability
   */
  _this.getGroundMotionForProbability = function (probability) {
    return -Math.log(1 - probability) / 50;
  };

  /**
   * Computes target ground motion
   * @param curve {array}
   *    array of (x, y) value pairs
   * @param probability {number}
   *    Custom probability
   */
  _this.getTargetedGroundMotion = function (curve, probability) {
    var afe,
        bounds,
        result;

    afe = _this.getGroundMotionForProbability(probability);
    bounds = _this.findBounds(curve, afe);

    result = _this.numberUtils.interpolate(
      bounds[0][0],
      bounds[0][1],
      bounds[1][0],
      bounds[1][1],
      afe,
      _this.numberUtils.INTERPOLATE_USING_LOG
    );

    return result;
  };


  _initialize(options);
  options = null;
  return _this;

};

module.exports = TargetGroundMotion;
