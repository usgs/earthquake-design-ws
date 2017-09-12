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
   * Computes a horizontal design response spectrum.
   *
   * @param gms {Double}
   *     Ground motion for 0.2 second spectral period
   * @param gm1 {Double}
   *     Ground motion for 1.0 second spectral period
   * @param tl {Integer}
   *     Long-period/transition period. Not currently used...
   *
   * @return {Promise}
   *     A promise that resolves with the {XY_Series} data for a spectrum,
   *     or rejects with an {Error} if one should occur.
   */
  _this.getHorizontalSpectrum = function (gms, gm1, tl) {
    return new Promise((resolve/*, reject*/) => {
      let spectrum,
          times;

      if (gms === null || gm1 === null) {
        spectrum = [];
        spectrum.push([null]);
        resolve(spectrum);
        return;
      }

      // If 1.0-second ground motion exceeds 0.2-second ground motion,
      // take the 0.2-second ground motion to equal the 1.0-second ground
      // motion. This prevents awkward spectra results
      if (gm1 > gms) {
        gms = gm1;
      }

      const T_S = gm1 / gms;
      const T_0 = 0.2 * T_S;
      const T_L = tl;

      spectrum = [];
      times = _this.getTimeValues(gms, gm1, tl);
      times.forEach(function(time) {
        let s_a;

        if (time < T_0) {
          // T < T_0 :: S_a = gms * [0.4 + (0.6 T / T_0)]
          s_a = gms * (0.4 + ( (0.6 * time) / T_0) );
        } else if (time <= T_S) {
          // T_0 <= T <= T_s :: S_a = gms
          s_a = gms;
        } else if (time <= T_L) {
          // T_s < T <= T_L :: S_a = gm1 / T
          s_a = gm1 / time;
        } else {
          // T_L < T <= _this.timeMax :: S_a = gm1 * T_L / T^2
          s_a = ( gm1 * T_L / ( time * time ) );
        }

        spectrum.push([time, s_a]);
      });

      resolve(spectrum);
    });
  };

  /**
   * Computes time values for a design response spectrum.
   *
   * @param gms {Double}
   *     Ground motion for 0.2 second spectral period
   * @param gm1 {Double}
   *     Ground motion for 1.0 second spectral period
   * @param tl {Integer}
   *     Long-period/transition period.
   *
   * @return {Promise}
   *     A promise that resolves with the {Array} of time values for a spectrum,
   *     or rejects with an {Error} if one should occur.
   */
  _this.getTimeValues = function (gms, gm1, tl) {
    let index,
        t,
        timeMax,
        times,
        ts;

    // If 1.0-second ground motion exceeds 0.2-second ground motion,
    // take the 0.2-second ground motion to equal the 1.0-second ground
    // motion. This prevents awkward spectra results
    if (gms === null || gm1 === null) {
      times = [];
      times.push(null);
      return times;
    }

    if (gm1 > gms) {
      gms = gm1;
    }

    times = [];
    ts = gm1 / gms;

    times.push(0);
    times.push(0.2 * ts);
    times.push(ts);
    times.push(0.025);

    // Use tl+1 if defined, otherwise using timeMax value
    timeMax = (typeof(tl) === 'undefined') ? _this.timeMax : (tl + 1);

    t = 0;
    index = 1;
    while (t < timeMax) {
      t = (_this.timeIncrement * index);
      times.push(+t.toFixed(3));
      index += 1;
    }

    // Sort in ascending order
    times.sort();

    // Remove duplicate values
    times = times.filter(function(item, pos, arr){
      return pos === 0 || item !== arr[pos-1];
    });

    return times;
  };

  /**
   * Computes a vertical design response spectrum.
   *
  * @param gms {Double}
   *     Ground motion for 0.2 second spectral period
   * @param gm1 {Double}
   *     Ground motion for 1.0 second spectral period
   * @param tl {Integer}
   *     Long-period/transition period.
   * @param cv {Double}
   *     Vertical Coefficient
   *
   * @return {Promise}
   *     A promise that resolves with the {XY_Series} data for a spectrum,
   *     or rejects with an {Error} if one should occur.
   */
  _this.getVerticalSpectrum = function (gms, gm1, tl, cv) {
    return new Promise((resolve/*, reject*/) => {
      let spectrum,
          times;

      if (gms === null || gm1 === null || tl === null || cv === null) {
        spectrum = [];
        spectrum.push([null]);
        resolve(spectrum);
        return;
      }

      // If 1.0-second ground motion exceeds 0.2-second ground motion,
      // take the 0.2-second ground motion to equal the 1.0-second ground
      // motion. This prevents awkward spectra results
      if (gm1 > gms) {
        gms = gm1;
      }

      spectrum = [];
      times = _this.getTimeValues(gms, gm1, tl);

      for(let idx = 0; idx < times.length; idx++) {
        let s_a,
            time;

        time = times[idx];

        if (time > 2.0) {
          // Vertical Periods greater than 2 seconds require a site specific procedure.
          break;
        }

        if (time <= 0.025) {
          // T <= 0.025 :: s_amv = 0.3 * cv * gms
          s_a = 0.3 * cv * gms;
        } else if (time <= 0.05) {
          // T > 0.025 AND T <= 0.05 :: s_amv = 20 * cv * gms * (time - 0.025) + 0.3 * cv * gms
          s_a = 20 * cv * gms * (time - 0.025) + 0.3 * cv * gms;
        } else if (time <= 0.15) {
          // T > 0.05 AND T <= 0.15 :: s_amv = 0.8 * cv * gms
          s_a = 0.8 * cv * gms;
        } else {
          // T <= 2.0 :: s_amv = 0.8 * cv * gms * (0.15/time)^0.75
          s_a = 0.8 * cv * gms * Math.pow(0.15/time, 0.75);
        }

        spectrum.push([time, s_a]);
      }

      resolve(spectrum);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = SpectraFactory;
