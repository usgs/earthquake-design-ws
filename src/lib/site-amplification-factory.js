'use strict';


const extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


const _DEFAULTS = {};

/**
 * Factory for computing site amplification values "Fa", "Fv", and "Fpga"
 * corresponding to a given "Ss", "S1", and "PGA" respectively for a given
 * reference document.
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
const SiteAmplificationFactory = function (options) {
  let _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instances of a SiteAmplificationFactory
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.db = options.db;
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
   * Make request to site-amplification schema for ground motion level bins
   *
   * @param refereceDocument {String}
   *     The reference document to get ground motion levels
   *     (i.e. "ASCE7-05", "ASCE7-10", ...)
   *
   * @param spectralPeriod {String}
   *     The spectral period to get ground motion levels
   *     (i.e. "s1", "ss", or "pga")
   *
   * @return {Promise}
   *         database row with ground motion levels
   */
  _this.getGroundMotionLevels = function (referenceDocument, spectralPeriod) {
    return _this.db.query(`
        SELECT
          ground_motion_level.value as bin
        FROM
          ground_motion_level, lookup
        WHERE
          ground_motion_level.lookup_id = lookup.id
        AND lookup.reference_document = $1
        AND lookup.type = $2
      `, [
        referenceDocument,
        spectralPeriod
      ]
    );
  };

  /**
   * Make request to site-amplification schema for site amplication factor bins
   *
   * @param refereceDocument {String}
   *     The reference document to calculate site amplification factors
   *     (i.e. "ASCE7-05", "ASCE7-10", ...)
   *
   * @param spectralPeriod {String}
   *     The spectral period to calculate site amplification factors
   *     (i.e. "s1", "ss", or "pga")
   *
   * @param siteClass {String}
   *     The site class to calculate site amplification factors
   *     (i.e. "A", "B", "C", ...)
   *
   * @return {Promise}
   *         database row with site amplification factors
   */
  _this.getSiteAmplificationFactors = function (referenceDocument, spectralPeriod, siteClass) {
    return _this.db.query(`
        SELECT
          amplification_factor.value as factors
        FROM
          amplification_factor, lookup
        WHERE
          amplification_factor.lookup_id = lookup.id
        AND lookup.reference_document = $1
        AND lookup.type = $2
        AND amplification_factor.site_class = $3
      `, [
        referenceDocument,
        spectralPeriod,
        siteClass
      ]
    );
  };

  /**
   * Make request to site-amplification schema for restrictions
   *
   * @param refereceDocument {String}
   *     The reference document to determine restrictions
   *     (i.e. "ASCE7-05", "ASCE7-10", ...)
   *
   * @param spectralPeriod {String}
   *     The spectral period to determine restrictions
   *     (i.e. "s1", "ss", or "pga")
   *
   * @param siteClass {String}
   *     The site class to determine restrictions
   *     (i.e. "A", "B", "C", ...)
   *
   * @return {Promise}
   *         database row with ground motion levels
   */
  _this.getRestrictions = function (referenceDocument, spectralPeriod, siteClass) {
    return _this.db.query(`
        SELECT
          restriction."limit",
          restriction.message
        FROM
          restriction, lookup
        WHERE
          restriction.lookup_id = lookup.id
        AND lookup.reference_document = $1
        AND lookup.type = $2
        AND restriction.site_class = $3
      `, [
        referenceDocument,
        spectralPeriod,
        siteClass
      ]
    );
  };

  /**
   * Delegates site amplification coefficient calculations for
   * ss, s1, and pga values.
   *
   * @param inputs {Object}
   *     Input parameters required to compute the site amplification.
   * @param inputs.referenceDocument {String}
   *     Well-known string identifying the reference document for which to
   *     compute site-amplification values.
   * @param inputs.siteClass {Integer|String}
   *     Text identifying the site-class for which to compute
   *     site-amplification values.
   * @param inputs.ss {Double} Optional
   *     The Ss value for which to compute Fa. If no `ss` value is present,
   *     the result object will contain an `fa` value of `undefined`.
   * @param inputs.s1 {Double} Optional
   *     The S1 value for which to compute Fv. If no `s1` value is present,
   *     the result object will contain an `fv` value of `undefined`.
   * @param inputs.pga {Double} Optional
   *     The PGA value for which to compute Fpga. If no `pga` value is present,
   *     the result object will contain an `fpga` value of `undefined`.
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing
   *     the `fa`, `fv`, and `fpga` site amplification values.
   */
  _this.get = function (inputs) {
    return Promise.all([
      _this.getSiteAmplificationData('ss', inputs),
      _this.getSiteAmplificationData('s1', inputs),
      _this.getSiteAmplificationData('pga', inputs)
    ]).then((results) => {
      let pgaResult,
          s1Result,
          ssResult;

      ssResult = results[0];
      s1Result = results[1];
      pgaResult = results[2];

      return {
        fa: ssResult.factor,
        fa_note: ssResult.note,
        fv: s1Result.factor,
        fv_note: ssResult.note,
        fpga: (pgaResult ? pgaResult.factor : undefined),
        fpga_note: (pgaResult ? pgaResult.note : undefined)
      };
    });
  };

  /**
   * Computes the site amplification coefficient values for a specific
   * spectral period
   *
   * @param spectralPeriod {Object}
   *     The spectral period ("ss", "s1", or "pga") required to compute
   *     the site amplification.
   * @param inputs {Object}
   *     Input parameters required to compute the site amplification.
   * @param inputs.referenceDocument {String}
   *     Well-known string identifying the reference document for which to
   *     compute site-amplification values.
   * @param inputs.siteClass {Integer|String}
   *     Text identifying the site-class for which to compute
   *     site-amplification values.
   * @param inputs.ss {Double} Optional
   *     The Ss value for which to compute Fa. If no `ss` value is present,
   *     the result object will contain an `fa` value of `undefined`.
   * @param inputs.s1 {Double} Optional
   *     The S1 value for which to compute Fv. If no `s1` value is present,
   *     the result object will contain an `fv` value of `undefined`.
   * @param inputs.pga {Double} Optional
   *     The PGA value for which to compute Fpga. If no `pga` value is present,
   *     the result object will contain an `fpga` value of `undefined`.
   *
   * @return {Promise}
   *     A promise that will resolve with an object containing
   *     the `fa`, `fv`, or `fpga` site amplification value and note for that
   *     site amplification value.
   */
  _this.getSiteAmplificationData = function (spectralPeriod, inputs) {
    let referenceDocument,
        siteClass;

    inputs = inputs || {};

    return Promise.resolve().then(() => {

      if (inputs.hasOwnProperty(spectralPeriod)) {
        referenceDocument = inputs.referenceDocument;
        siteClass = inputs.siteClass;

        if (!referenceDocument) {
          throw new Error('"referenceDocument" must be provided to compute ' +
              'site amplification values.');
        }

        if (!siteClass) {
          throw new Error('"siteClass" must be provided to compute site ' +
              'amplification values.');
        }

        return Promise.all([
          _this.getGroundMotionLevels(referenceDocument, spectralPeriod),
          _this.getSiteAmplificationFactors(referenceDocument, spectralPeriod, siteClass),
          _this.getRestrictions(referenceDocument, spectralPeriod, siteClass)
        ]).then((promiseResults) => {
          let bins,
              data,
              factor,
              note,
              restriction;

          bins = promiseResults[0].rows[0];
          data = promiseResults[1].rows[0];
          restriction = promiseResults[2].rows[0];

          factor = NumberUtils.interpolateBinnedValue(
              bins.bin,
              data.factors,
              inputs[spectralPeriod]
            );

          if (typeof restriction !== 'undefined' && inputs[spectralPeriod] >= restriction.limit) {
            if (referenceDocument === 'ASCE7-16') {
              factor = null;
            }
            note = restriction.message;
          }

          return {
            factor: factor,
            note: note
          };
        });
      }
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = SiteAmplificationFactory;
