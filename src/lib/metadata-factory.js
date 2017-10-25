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
  AND docuemnt.region_id = $2::Integer
`;

const _QUERY_REGION = `
  SELECT
    *
  FROM
    region
  WHERE
    region.max_latitude >= $1::Numeric
  AND region.min_latitude <= $1::Numeric
  AND region.max_longitude >= $2::Numeric
  AND region.min_longitude <= $2::Numeric
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
   * Get metadata associated with inputs of referenceDocument,
   * latitude, and longitude
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *     inputs.referenceDocument {String}
   *
   * @return {Promise}
   *     A promise that resolves with probabilistic metadata or rejects if an
   *     error occurs.
   */
  _this.getMetadata = function (inputs) {
    let region;

    return _this.getRegion(inputs.latitude, inputs.longitude).then((result) => {
      region = result;
      return _this.getData(inputs.referenceDocument, region);
    }).catch((err) => {
      process.stdout.write(err.stack);
    });
  };

  _this.getData = function (referenceDocument, region) {
    let result;

    return _this.db.query(_this.queryData, [referenceDocument, region]).then((data) => {
      // determine metadata set based on referenceDocument
      result = {};
      // loop through metadata objects
      for (let i = 0; i < data.length; i++) {
        result[data.key] = data.value;
      }

      return result;
    });
  };

  /**
   * Gets name of particular region based on the location
   * specified by `inputs.latitude` and `inputs.longitude`.
   *
   * @param inputs {Object}
   *     inputs.latitude {Number}
   *     inputs.longitude {Number}
   *
   * @return {String}
   *     The name of the region that contains the lat/lng reference point
   */
  _this.getRegion = function (latitude, longitude) {
    return _this.db.query(_this.queryRegion, [latitude, longitude]).then((regions) => {
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
