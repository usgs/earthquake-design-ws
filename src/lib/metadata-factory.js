'use strict';


const extend = require('extend');


const _QUERY_DATA = `
  SELECT
    metadata.*
  FROM
    document, metadata
  WHERE
    document.id = metadata.document_id
  AND document.name = $1::Varchar
  AND document.region_id = $2::Integer
`;

const _QUERY_REGION = `
  SELECT
    region.*
  FROM
    region, document
  WHERE
    region.id = document.region_id
  AND region.max_latitude >= $1::Numeric
  AND region.min_latitude <= $1::Numeric
  AND region.max_longitude >= $2::Numeric
  AND region.min_longitude <= $2::Numeric
  AND document.name = $3::Varchar
`;


const _DEFAULTS = {
  'query_region': _QUERY_REGION,
  'query_data': _QUERY_DATA
};


const MetadataFactory = function (options) {
  let _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.db = options.db;

    _this.queryData = options.query_data;
    _this.queryRegion = options.query_region;
  };


  /**
   * computes the size of a region.
   *
   * @param inputs {object}
   *        region.max_latitude {number}
   *        region.min_latitude {number}
   *        region.max_longitude {number}
   *        region.min_longitude {number}
   * @return {number}
   *        The area of the given extents.
   */
  _this._computeRegionArea = function (region) {
    let area,
        height,
        width;

    height = Math.abs(region.max_latitude - region.min_latitude);
    width = Math.abs(region.max_longitude - region.min_longitude);
    area = width * height;

    return area;
  };

  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  /**
   * Get region and metadata information associated with inputs of
   * referenceDocument, latitude, and longitude
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *     inputs.referenceDocument {String}
   *
   * @return {Promise}
   *     A promise that resolves with metadata or rejects if an
   *     error occurs.
   */
  _this.getMetadata = function (inputs) {
    let latitude,
        longitude,
        referenceDocument;

    latitude = parseFloat(inputs.latitude);
    longitude = parseFloat(inputs.longitude);
    referenceDocument = inputs.referenceDocument;

    return _this.getRegion(latitude, longitude, referenceDocument).then((region) => {
      return _this.getData(inputs.referenceDocument, region);
    }).catch((err) => {
      process.stdout.write(err.stack);
    });
  };


  /**
   * Performs metadata query for a referenceDocument and region, and parses
   * the metadata information into a metadata object.
   *
   * @param inputs {Object}
   *     inputs.referenceDocument {String}
   *     inputs.region {Integer}
   *
   * @return {Promise}
   *     A promise that resolves with metadata or rejects if an
   *     error occurs.
   */
  _this.getData = function (referenceDocument, region) {
    let metadata,
        params,
        results;

    params = [referenceDocument, region];

    return _this.db.query(_this.queryData, params).then((data) => {
      results = data.rows;
      // determine metadata set based on referenceDocument
      metadata = {};
      // loop through metadata objects
      for (let i = 0; i < results.length; i++) {
        metadata[results[i].key] = results[i].value;
      }

      return metadata;
    });
  };

  /**
   * Performs region query and returns id based on the location specified
   * by `inputs.latitude` and `inputs.longitude`, and the corresponding
   * referenceDocument
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *
   * @return {String}
   *     The name of the region that contains the lat/lng reference point
   */
  _this.getRegion = function (latitude, longitude, referenceDocument) {
    let params,
        regions;

    params = [latitude, longitude, referenceDocument];

    return _this.db.query(_this.queryRegion, params).then((results) => {
      regions = results.rows;
      // if more than one region is found then use the smallest region
      if (regions.length > 1) {
        // sort region by size
        regions.sort((a, b) => {
          let aArea,
              bArea;

          aArea = _this._computeRegionArea(a);
          bArea = _this._computeRegionArea(b);

          return aArea - bArea;
        });
      }

      if (regions.length !== 0) {
        return regions[0].id;
      }

      throw new Error('No metadata exists. ' + latitude + ' ' + longitude);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};



module.exports = MetadataFactory;
