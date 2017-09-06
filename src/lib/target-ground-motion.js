'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils');


var _DEFAULTS;

_DEFAULTS = {
  numberUtils: NumberUtils.instance
};


var TargetGroundMotion = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.numberUtils = options.numberUtils;
  };

  /**
   * Destroy all the things.
   *
   */
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
   * @param curve {Array}
   *    array of [x, y] value pairs
   *
   * @param afe {Number}
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

    for (i = 0, len = curve.length; i < (len - 1); i++) {

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
          curve[0][1] + ' and ' + curve[(curve.length - 1)][1]);
    }

    return bounds;
  };

  /**
   * Uses the given probability to compute afe (Annual frequency of exceedance)
   *
   * @param probability {Number}
   *    Custom probability
   * @pparam years {Number}
   *    Custom years or defaults to 50 if years are not given
   */
  _this.getFrequencyForProbability = function (probability, years) {
    years = years || 50;

    return -Math.log(1 - probability) / years;
  };

  /**
   * Computes target ground motion
   &
   * @param curve {Array}
   *    array of (x, y) value pairs
   * @param probability {Number}
   *    Custom probability
   */
  _this.getTargetedGroundMotion = function (curve, probability, method) {
    var afe,
        bounds,
        result;

    afe = _this.getFrequencyForProbability(probability);
    bounds = _this.findBounds(curve, afe);
    method = method || _this.numberUtils.INTERPOLATE_LOGX_LOGY_LINEAR;

    result = _this.numberUtils.interpolate(
        bounds[0][1],
        bounds[0][0],
        bounds[1][1],
        bounds[1][0],
        afe,
        method
      );

    return result;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = TargetGroundMotion;
