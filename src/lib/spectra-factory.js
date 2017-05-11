'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  timeIncrement: 0.05, // Spacing between discrete time values
  timeMax: 2.0 // Time when to terminate discrete spectrum
};


/**
 * Factory for computing response spectra.
 *
 * @param option {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var SpectraFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor. Initializes the new factory instance.
   *
   * @param options.timeIncrement {Double}
   *     How far to step between time intervals when discretizing the
   *     spectrum
   * @param options.timeMax {Double}
   *     The largest time value to use when computing a spectrum
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.timeIncrement = options.timeIncrement;
    _this.timeMax = options.timeMax;
  };


  /**
   * Free resources associated with this factory.
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
   * Computes a design response spectrum.
   *
   * @param gms {Double}
   *     Ground motion for 0.2 second spectral period
   * @param gm1 {Double}
   *     Ground motion for 1.0 second spectral period
   * @param tl {Double}
   *     Long-period/transition period. Not currently used...
   *
   * @return {Promise}
   *     A promise that resolves with the {XY_Series} data for a spectrum,
   *     or rejects with an {Error} if one should occur.
   */
  _this.getSpectrum = function (gms, gm1/*, tl*/) {
    return new Promise((resolve, reject) => {
      var index,
          spectrum,
          t,
          ts;

      try {
        // If 1.0-second ground motion exceeds 0.2-second ground motion,
        // take the 0.2-second ground motion to equal the 1.0-second ground
        // motion. This prevents awkward spectra results

        if (gms === null || gm1 === null) {
          spectrum = [];
          spectrum.push([null]);
          return resolve(spectrum);
        }

        if (gm1 > gms) {
          gms = gm1;
        }

        spectrum = [];
        index = 1;
        ts = gm1 / gms;

        // T < T_0 :: S_a = gms * [0.4 + (0.6 T / T_0)]
        spectrum.push([0, 0.4 * gms]);
        spectrum.push([0.2 * ts, gms]);

        // T_0 <= T <= T_s :: S_a = gms
        spectrum.push([ts, gms]);

        ts = +(ts.toFixed(1)); // truncate to 1 decimal for discretization
        t = _this.timeIncrement + ts;

        // T_s < T <= T_L :: S_a = gm1 / T
        // TODO :: Cap this at min(_this.timeMax, T_L)
        while (t < _this.timeMax) {
          t = (_this.timeIncrement * index) + ts;
          spectrum.push([t, gm1/t]);
          index += 1;
        }

        // TODO :: Incorporate T_L
        // T_L < T <= _this.timeMax :: S_a = gm1 * T_L / T^2

        return resolve(spectrum);
      } catch (err) {
        return reject(err);
      }
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = SpectraFactory;
