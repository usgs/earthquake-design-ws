'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
};


/**
 * A stop-gap factory for producing metadata useful for
 * design purposes. This stop-gap implementation conforms to the final desired
 * API, but rather than fetching data directly, it fetches data from a
 * legacy web service using a {LegacyFactory}. This factory then up-converts
 * the results to conform to the latest API.
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var MetadataFactory = function (options) {
  var _initialize,
      _this;



  _this = {};

  /**
   * Constructor.
   * Instantiates a new {MetadataFactory}.
   *
   * @param options.legacyFactory {LegacyFactory}
   *     The underlying legacy factory used for fetching legacy results.
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.legacyFactory = options.legacyFactory;
  };


  /**
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Free any resources here

    _initialize = null;
    _this = null;
  };

  /**
   * Formats the result from the `legacyResult` to a simple object containing
   * the metadata.
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
      var metadata;

      try {
        metadata = legacyResult.output.metadata;

        return resolve({
          'pgadPercentileFactor': metadata.percentile_pga,
          'pgadFloor': metadata.deterministic_floor_pga,

          's1MaxDirFactor': metadata.max_direction_s1,
          's1dPercentileFactor': metadata.percentile_s1,
          's1dFloor': metadata.deterministic_floor_s1,

          'ssMaxDirFactor': metadata.max_direction_ss,
          'ssdPercentileFactor': metadata.percentile_ss,
          'ssdFloor': metadata.deterministic_floor_ss
        });
      } catch (err) {
        return reject(err);
      }
    });
  };

  /**
   * @param inputs {Object}
   *     Request parameters necessary for fetching metadata.
   *
   * @return {Promise}
   *     A promise that resolves with the metadata.
   */
  _this.getMetadata = function (inputs) {
    return _this.legacyFactory.getLegacyData(inputs).then((result) => {
      return _this.formatResult(result);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MetadataFactory;
