'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  roundPrecision: 3
};


var NumberUtils = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.roundPrecision = options.roundPrecision;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
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


  _initialize(options);
  options = null;
  return _this;
};


NumberUtils.instance = NumberUtils();


module.exports = NumberUtils;
