'use strict';


var extend = require('extend'),
    NumberUtils = require('./util/number-utils').instance;


var _DEFAULTS,
    _MOCK_DB,
    _QUERY_DATA,
    _QUERY_DOCUMENT,
    _QUERY_REGION;

_MOCK_DB = {
  query: (query, params) => {
    var result;

    if (query === _QUERY_REGION) {
      result = {rows: [{
        id: 1,
        grid_spacing: 0.01,
        max_latitude: 50.0,
        max_longitude: -65.0,
        min_latitude: 24.6,
        min_longitude: -125.0,
        name: 'E2008R2_COUS0P01_Deterministic'
      }]};
    } else if (query === _QUERY_DATA) {
      result = {rows: [{
        id: 9602302,
        region_id: 1,
        latitude: parseFloat(params[1]),
        longitude: parseFloat(params[2]),
        mapped_pgad: 0.5666,
        mapped_s1d: 0.4291,
        mapped_ssd: 1.3788
      }]};
    } else if (query === _QUERY_DOCUMENT) {
      result = {rows: [{
        id: 1,
        region_id: 1,
        floor_pgad: 0.5,
        floor_s1d: 0.6,
        floor_ssd: 1.5,
        interpolation_method: 'linear',
        max_direction_pgad: 1.0,
        max_direction_s1d: 1.3,
        max_direction_ssd: 1.1,
        model_version: 'v3.1.x',
        percentile_pgad: 1.8,
        percentile_s1d: 1.8,
        percentile_ssd: 1.8,
        name: 'ASCE41-13' // ?
      }]};
    } else {
      result = {rows: []};
    }

    return Promise.resolve(result);
  }
};


/**
 * @param $1 {Double}
 *     Latitude decimal degrees
 * @param $2 {Double}
 *     Longitude decimal degrees
 * @param $3 {Double}
 *     Grid spacing
 */
_QUERY_DATA = `
  SELECT
    id,
    region_id,
    latitude,
    longitude,
    mapped_pgad,
    mapped_s1d,
    mapped_ssd
  FROM
    data
  WHERE
    region_id = $1 AND
    latitude < ($2::Numeric + $4::Numeric) AND
    latitude > ($2::Numeric - $4::Numeric) AND
    longitude < ($3::Numeric + $4::Numeric) AND
    longitude > ($3::Numeric - $4::Numeric)
  ORDER BY
    latitude DESC,
    longitude ASC
`;

/**
 * @param $1 {Number}
 *     Latitude decimal degrees
 * @paran $2 {Number}
 *     Longitude decimal degrees
 */
_QUERY_REGION = `
  SELECT
    id,
    grid_spacing,
    max_latitude,
    max_longitude,
    min_latitude,
    min_longitude,
    name
  FROM
    region
  WHERE
    max_latitude >= $1 AND
    max_longitude >= $2 AND
    min_latitude <= $1 AND
    min_longitude <= $2
`;

/**
 * @param $1 {Number}
 *     Region ID
 */
_QUERY_DOCUMENT = `
  SELECT
    id,
    region_id,
    floor_pgad,
    floor_s1d,
    floor_ssd,
    interpolation_method,
    max_direction_pgad,
    max_direction_s1d,
    max_direction_ssd,
    model_version,
    percentile_pgad,
    percentile_s1d,
    percentile_ssd,
    name
  FROM
    document
  WHERE
    region_id = $1 AND
    name = $2
`;

_DEFAULTS = {
  db: _MOCK_DB
};


var DeterministicFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.db = options.db;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  _this.computeResult = function (metadata, data) {
    var pgad,
        s1d,
        ssd;

    return new Promise((resolve, reject) => {
      try {
        pgad = data.mapped_pgad * metadata.document.percentile_pgad;
        s1d = data.mapped_s1d * metadata.document.percentile_s1d;
        ssd = data.mapped_ssd * metadata.document.percentile_ssd;

        resolve({
          'data': extend(true, {}, data, {
            pgad:  Math.max(pgad, metadata.document.floor_pgad),
            s1d: Math.max(s1d, metadata.document.floor_s1d),
            ssd: Math.max(ssd, metadata.document.floor_ssd)
          }),
          'metadata': metadata
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  _this.getDeterministicData = function (inputs) {
    var metadata;

    return _this.getMetadata(inputs).then((result) => {
      metadata = result;
      return _this.getMappedData(metadata, inputs);
    }).then((data) => {
      return _this.computeResult(metadata, data);
    });
  };

  /**
   * Gets parameters associated with a particular document based in the
   * input region.id.
   *
   * @param region {Object}
   *     Object containing `region.id` property which is the id of the
   *     region used by the document to fetch.
   *
   * @return {Object}
   *     An object containing properties for each field in the _QUERY_DOCUMENT
   *     SELECT clause.
   */
  _this.getDocument = function (inputs, region) {
    var parameters;

    parameters = [
      parseInt(region.id, 10), // _QUERY_DOCUMENT::$1
      inputs.referenceDocument // _QUERY_DOCUMENT::$2
    ];

    return _this.db.query(_QUERY_DOCUMENT, parameters).then((result) => {
      return result.rows[0];
    });
  };

  /**
   *
   * @param metadata {Object}
   *     See result from `_this.getMetadata` function
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *
   * @return {Promise}
   *     A promise that resolves with deterministic data or rejects if an
   *     error occurs.
   */
  _this.getMappedData = function (metadata, inputs) {
    var parameters;

    inputs = inputs || {};
    inputs.region = inputs.region || {};

    parameters = [
      parseInt(metadata.region.id, 10),        // _QUERY_DATA::$1
      parseFloat(inputs.latitude),             // _QUERY_DATA::$2
      parseFloat(inputs.longitude),            // _QUERY_DATA::$3
      parseFloat(metadata.region.grid_spacing) // _QUERY_DATA::$4
    ];

    return _this.db.query(_QUERY_DATA, parameters).then((result) => {
      return _this.interpolate(result.rows, inputs, metadata);
    });
  };

  /**
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *     inputs.referenceDocument {String}
   *
   * @return {Promise}
   *     A promise that resolves with deterministic metadata or rejects if an
   *     error occurs.
   */
  _this.getMetadata = function (inputs) {
    var doc,
        region;

    return _this.getRegion(inputs).then((result) => {
      region = result;
      return _this.getDocument(inputs, region);
    }).then((result) => {
      doc = result;
    }).then(() => {
      return {
        region: region,
        document: doc
      };
    });
  };

  /**
   * Gets parameters associated with a particular region based on the location
   * specified by `inputs.latitude` and `inputs.longitude`.
   *
   * @param inputs {Object}
   *     Object with `inputs.latitude` and `inputs.longitude` properties
   *     indicating the region of interest.
   *
   * @return {Object}
   *     An object containing properties for each field in the _QUERY_REGION
   *     SELECT clause.
   */
  _this.getRegion = function (inputs) {
    var parameters;

    parameters = [
      parseFloat(inputs.latitude), // _QUERY_REGION::$1
      parseFloat(inputs.longitude) // _QUERY_REGION::$2
    ];

    return _this.db.query(_QUERY_REGION, parameters).then((result) => {
      return result.rows[0];
    });
  };

  /**
   * @param rows {Array}
   *     An ordered array of results from the database. Contains
   *     latitude/longitude/mapped_X properties for each matching grid point.
   * @param inputs {Object}
   *     An object containing `latitude` and `longitude` properties identifying
   *     the location of interest.
   * @param metadata {Object}
   *     An object containing `document.interpolation_method` property
   *     indicating which spatial interpolation should be used.
   *
   * @return {Object}
   *     An object containing
   */
  _this.interpolate = function (rows, inputs, metadata) {
    var method;

    if (metadata.document.interpolation_method === 'log') {
      method = NumberUtils.INTERPOLATE_USING_LOG;
    } else {
      method = NumberUtils.INTERPOLATE_USING_LINEAR;
    }

    return NumberUtils.spatialInterpolate(rows, inputs.latitude,
        inputs.longitude, method);
  };


  _initialize(options);
  options = null;
  return _this;
};


DeterministicFactory.QUERY_DATA = _QUERY_DATA;
DeterministicFactory.QUERY_DOCUMENT = _QUERY_DOCUMENT;
DeterministicFactory.QUERY_REGION = _QUERY_REGION;


module.exports = DeterministicFactory;
