'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  gridSpacing: 0.05, // Spacing between gridpoints
};

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
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.gridSpacing = options.gridSpacing;
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

  /**
   * Interpolates between 4, 2, or 1-point(s)
   *
   * @return {object}
   *         The interpolated point
   */
  _this.interpolate = function () {
    // TODO
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = GroundMotionFactory;