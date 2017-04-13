'use strict';


var extend = require('extend'),
    http = require('http'),
    https = require('https'),
    DesignHazardMetadata = require('./util/design-hazard-metadata'),
    querystring = require('querystring'),
    url = require('url');


var _DEFAULTS;

_DEFAULTS = {
  metadata: null,
  url: 'https://earthquake.usgs.gov/hazws/staticcurve/1/{edition}/{region}/{longitude}/{latitude}/{imt}/{vs30}'
};


/**
 * Factory for Unified Hazard Tool (UHT) static hazard curve data.
 *
 * @param options {Object}
 * @param options.url {String}
 *    UHT URL.
 */
var UHTHazardCurveFactory = function (options) {
  var _this,
      _initialize;

  _this = {};


  /**
   * Constructor.
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    if (options.metadata) {
      _this.metadata = options.metadata;
    } else {
      _this.destroyMetadata = true;
      _this.metadata = DesignHazardMetadata();
    }
    _this.url = options.url;
  };


  /**
   * Free factory resources.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    if (_this.destroyMetadata) {
      _this.metadata.destroy();
      _this.metadata = null;
    }

    _initialize = null;
    _this = null;
  };


  /**
   * Fetch curves for a location based on design edition.
   *
   * Uses design edition to determine
   *   - hazard edition
   *   - hazard region
   *   - grid spacing
   *
   * Then requests hazard curves for points surrounding request location.
   *
   * @param options {Object}
   * @param options.designEdition {String}
   * @param options.latitude {Number}
   * @param options.longitude {Number}
   * @return {Promise}
   */
  _this.getDesignCurves = function (options) {
    return _this.metadata.getHazardMetadata(options).then((metadata) => {
      return _this.getHazardCurves({
        gridSpacing: metadata.gridSpacing,
        hazardEdition: metadata.hazardEdition,
        hazardRegion: metadata.hazardRegion,
        latitude: options.latitude,
        longitude: options.longitude
      });
    });
  };

  /**
   * Given a gridSpacing, find the 1, 2, or 4 points
   * on grid that surround the specified location.
   *
   * @param gridSpacing {Number}
   * @param latitude {Number}
   * @param longitude {Number}
   *
   * @return {Array<Object>}
   *.    1, 2, or 4 points surrounding input location.
   */
  _this.getGridPoints = function (options) {
    var bottom,
        gridSpacing,
        latitude,
        left,
        longitude,
        points,
        right,
        top;

    gridSpacing = options.gridSpacing;
    latitude = options.latitude;
    longitude = options.longitude;

    top = Math.ceil(latitude / gridSpacing) * gridSpacing;
    left = Math.floor(longitude / gridSpacing) * gridSpacing;
    bottom = top - gridSpacing;
    right = left + gridSpacing;
    // handle floating point precision errors
    top = parseFloat(top.toPrecision(10));
    left = parseFloat(left.toPrecision(10));
    bottom = parseFloat(bottom.toPrecision(10));
    right = parseFloat(right.toPrecision(10));

    if (top === latitude && left === longitude) {
      // point is on grid
      points = [
        {
          latitude: top,
          longitude: left
        }
      ];
    } else if (left === longitude) {
      // point is on vertical line between two grid points
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: bottom,
          longitude: left
        }
      ];
    } else if (top === latitude) {
      // point is on horizontal line between two grid points
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: top,
          longitude: right
        }
      ];
    } else {
      points = [
        {
          latitude: top,
          longitude: left
        },
        {
          latitude: top,
          longitude: right
        },
        {
          latitude: bottom,
          longitude: left
        },
        {
          latitude: bottom,
          longitude: right
        }
      ];
    }

    return points;
  };

  /**
   * Fetch curves for a location based on hazard edition and region.
   *
   * @param gridSpacing {Number}
   * @param hazardEdition {String}
   * @param hazardRegion {String}
   * @param latitude {Number}
   * @param longitude {Number}
   * @return {Promise}
   */
  _this.getHazardCurves = function (options) {
    var hazardEdition,
        hazardRegion,
        points,
        requests;

    hazardEdition = options.hazardEdition;
    hazardRegion = options.hazardRegion;

    // get grid points to request
    points = _this.getGridPoints({
      gridSpacing: options.gridSpacing,
      latitude: options.latitude,
      longitude: options.longitude
    });

    // build and start requests
    requests = points.map(function (point) {
      var url;

      url = _this.getHazardCurveUrl({
        hazardEdition: hazardEdition,
        hazardRegion: hazardRegion,
        latitude: point.latitude,
        longitude: point.longitude
      });

      return _this.makeRequest({
        url: url
      });
    });

    return Promise.all(requests).then((responses) => {
      return responses.map(_this.parseHazardCurves);
    }).then((parsed) => {
      var curves;

      // Build an object of curve arrays indexed by spectral period.
      // Each curve array is ordered top-left to bottom-right, typewriter style
      curves = {};
      parsed.forEach((corner) => {
        corner.forEach((curve) => {
          if (!curves.hasOwnProperty(curve.spectralPeriod)) {
            curves[curve.spectralPeriod] = [];
          }
          curves[curve.spectralPeriod].push(curve);
        });
      });

      return curves;
    });
  };

  /**
   * Get URL for a UHT hazard curve request.
   *
   * @param options {Object}
   * @param options.hazardEdition {String}
   * @param options.hazardRegion {String}
   * @param options.latitude {Number}
   * @param options.longitude {Number}
   *
   * @return {String}
   *     URL for hazard curve request.
   */
  _this.getHazardCurveUrl = function (options) {
    var hazardUrl;

    hazardUrl = _this.url;
    hazardUrl = hazardUrl.replace('{edition}',
        querystring.escape(options.hazardEdition));
    hazardUrl = hazardUrl.replace('{region}',
        querystring.escape(options.hazardRegion));
    hazardUrl = hazardUrl.replace('{latitude}',
        querystring.escape(options.latitude));
    hazardUrl = hazardUrl.replace('{longitude}',
        querystring.escape(options.longitude));
    hazardUrl = hazardUrl.replace('{imt}', 'any');
    hazardUrl = hazardUrl.replace('{vs30}', '760');

    return hazardUrl;
  };

  /**
   * Request a URL.
   *
   * @param options {Object}
   * @param options.url {String}
   *     url to request.
   *
   * @return {Promise}
   */
  _this.makeRequest = function (options) {
    return new Promise((resolve, reject) => {
      var client,
          hostname,
          params,
          path,
          port,
          request;

      // convert URL to node-friendly options
      params = url.parse(options.url);
      hostname = params.hostname;
      if (params.port) {
        port = params.port;
      } else if (params.protocol === 'https:') {
        port = 443;
      } else {
        port = 80;
      }
      client = (port === 443 ? https : http);
      path = params.pathname;

      options = {
        hostname: hostname,
        port: port,
        path: path
      };


      request = client.request(options, (response) => {
        var buffer;

        buffer = [];

        response.on('data', (data) => {
          buffer.push(data);
        });

        response.on('end', () => {
          try {
            resolve(JSON.parse(buffer.join('')));
          } catch (e) {
            reject(e);
          }
        });
      });

      request.on('error', (err) => {
        reject(err);
      });

      request.end();
    });
  };

  /**
   * Parse a UHT JSON response into curve objects.
   *
   * @param uhtResponse {Object}
   * @return {Array<Object>}
   *
   * Returned objects have the following keys and values:
   *   hazardEdition {String}
   *   hazardRegion {String}
   *   latitude {Number}
   *   longitude {Number}
   *   spectralPeriod {String}
   *   vs30 {String}
   *   data {Array<Array<x, y>>}
   */
  _this.parseHazardCurves = function (uhtResponse) {
    var curves;

    curves = uhtResponse.response.map((response) => {
      var curve,
          metadata,
          yvals;

      metadata = response.metadata;
      yvals = response.data[0].yvals;

      curve = {
        hazardEdition: metadata.edition.value,
        hazardRegion: metadata.region.value,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        spectralPeriod: metadata.imt.value,
        vs30: metadata.vs30.value,
        data: metadata.xvals.map((x, i) => {
          return [x, yvals[i]];
        })
      };

      return curve;
    });

    return curves;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = UHTHazardCurveFactory;
