'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
};


/**
 * A stop-gap factory for producing deterministic hazard data useful for
 * design purposes. This stop-gap implementation conforms to the final desired
 * API, but rather than fetching data directly, it fetches data from a
 * legacy web service using a {LegacyFactory}. This factory then up-converts
 * the results to conform to the latest API.
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var DeterministicHazardFactory = function (options) {
  var _initialize,
      _this;



  _this = {};

  /**
   * Constructor.
   * Instantiates a new {DeterministicHazardFactory}.
   *
   * @param options.legacyFactory {LegacyFactory}
   *     The underlying legacy factory used for fetching legacy results.
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.legacyFactory = options.legacyFactory;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Free any resources here

    _initialize = null;
    _this = null;
  };
  /**
   * @param inputs {Object}
   *     Request parameters necessary for fetching deterministic data.
   *
   * @return {Promise}
   *     A promise that resolves with the deterministic data.
   */
  _this.getDeterministicData = function (inputs) {
    return _this.legacyFactory.getLegacyData(inputs).then((result) => {
      return _this.formatResult(result);
    });
  };

  /**
   * Formats the result from the `legacyResult` to a simple object containing
   * the deterministic data.
   *
   * @param legacyResult {Object}
   *     The legacy result returned from the legacy factory.
   *
   * @return {Promise}
   *     A promise that resolves with the formatted result, or rejects with
   *     an error if one should occur.
   */
  _this.formatResult = function (legacyResult) {
    return new Promise((resolve, reject) => {
      var data;

      try {
        data = legacyResult.output.data[0];

        return resolve({
          ssd: data.geomean_ssd,
          s1d: data.geomean_s1d,
          pgad: data.geomean_pgad
        });
      } catch (err) {
        return reject(err);
      }
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = DeterministicHazardFactory;
