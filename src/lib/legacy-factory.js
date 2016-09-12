'use strict';

var extend = require('extend'),
    http = require('http'),
    url = require('url');

var _DEFAULTS = {
  url: 'https://earthquake.usgs.gov/designmaps/beta/us/service/'
};


var LegacyFactory = function (options) {
  var _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    var params;

    options = extend({}, _DEFAULTS, options);

    // parse url to get web service details
    params = url.parse(options.url);
    _this.hostname = params.hostname;
    _this.port = params.port;
    _this.path = params.pathname;
  };

  /**
   * Translate new parameters to old inputs for legacy web service. All of the
   * required inputs have already been verified by the handler.
   *
   * @param inputs {Object}
   *        An object containing the new inputs for the composite web service
   *
   * @return {Object}
   *        An object containing new inputs mapped to the legacy inputs
   */
  _this.cleanseInputs = function (inputs) {
    var params;

    params = {
      design_code: inputs.referenceDocument,
      latitude: inputs.latitude,
      longitude: inputs.longitude,
      risk_category: inputs.riskCategory,
      site_class: inputs.siteClass,
      title: inputs.title
    };

    return params;
  };

  /**
   * Free references.
   */
  _this.destroy = function () {
    _initialize = null;
    _this = null;
  };

  /**
   * Query the legacy web service and interpolate results
   *
   * @param inputs {object}
   *        new web service inputs to be translated to legacy inputs
   * @return {String}
   *        legacy JSON response
   */
  _this.getLegacyData = function (inputs) {
    var params;

    // cleanse inputs to use legacy format
    params = _this.cleanseInputs(inputs);

    // return promise with interpolated data
    return _this.makeRequest(params).then((result) => {
      // perform bi-linear spatial interpolation
      return _this.interpolate(result);
    });
  };

  /**
   * Checks for 1, 2, or 4 data points to interpolate any other number of points
   * will throw an error.
   *
   * @param Object {calculation}
   *                    takes a calculation
   *
   * returns Model results
   */
  _this.interpolate = function (calculation) {
    var data,
        input,
        lat1,
        lat2,
        lat3,
        lng1,
        lng2,
        lng3,
        lng4,
        latInput,
        lngInput,
        log,
        metadata,
        output,
        result,
        resultLat1,
        resultLat3;

    input = calculation.input;
    output = calculation.output;
    data = output.data;
    latInput = input.latitude;
    lngInput = input.longitude;
    metadata = output.metadata;
    log = metadata.interpolation_method;

    if (data.length === 1) {
      result = extend({}, data[0]);

    } else if (data.length === 2) {
      lat1 = data[0].latitude;
      lat2 = data[1].latitude;
      lng1 = data[0].longitude;
      lng2 = data[1].longitude;

      if (lat1 === lat2) {
        result = _this.interpolateResults(
            data[0],
            data[1],
            lngInput,
            lng1,
            lng2,
            log);

      } else if (lng1 === lng2) {
        result = _this.interpolateResults(
            data[0],
            data[1],
            latInput,
            lat1,
            lat2,
            log);

      } else {
        throw new Error('Lat or Lng don\'t match and only 2 data points');
      }
    } else if (data.length === 4) {
      lat1 = data[0].latitude;
      lat3 = data[2].latitude;

      lng1 = data[0].longitude;
      lng2 = data[1].longitude;
      lng3 = data[2].longitude;
      lng4 = data[3].longitude;

      resultLat1 = _this.interpolateResults(
          data[0],
          data[1],
          lngInput,
          lng1,
          lng2,
          log);

      resultLat3 = _this.interpolateResults(
          data[2],
          data[3],
          lngInput,
          lng3,
          lng4,
          log);

      result = _this.interpolateResults(
          resultLat1,
          resultLat3,
          latInput,
          lat1,
          lat3,
          log);

    } else {
      throw new Error('Does not have 1, 2, or 4 points.');
    }

    return result;
  };


  /**
   * Interpolates results
   *
   * @param variable {int, int, int, int, int}
   */
  _this.interpolateResults = function (d0, d1, x, x0, x1, log) {
    var key,
        result;

    result = {};

    for (key in d0) {
      if (d0.hasOwnProperty(key) && d1.hasOwnProperty(key)) {
        result[key] =
            _this.interpolateValue(d0[key], d1[key], x, x0, x1, log);
      }
    }
    return result;
  };

  /**
   * Interpolates a single value logs y values before interpolation
   * if linerlog is passed in.
   *
   * @param variable {int, int, int, int, int, string}
   *                 interpolation values
   */
  _this.interpolateValue = function (y0, y1, x, x0, x1, log) {
    var value;

    if (log === 'linearlog') {
      if (y0 === 0 || y1 === 0) {
        throw new Error('Can not get the log of 0 Y values.');
      } else {
        y0 = Math.log(y0);
        y1 = Math.log(y1);
        value = Math.exp(y0 + (((y1-y0)/(x1-x0))*(x-x0)));
      }
    } else {
      value = y0 + (((y1-y0)/(x1-x0))*(x-x0));
    }
    return value;
  };

  /**
   * Creates a new Promise and makes request to the legacy web service
   *
   * @param  {Object}
   *         Input parameters for legacy web service
   *
   * @return {Promise}
   *         Promise with legacy web service results
   */
  _this.makeRequest = function (inputs) {
    return new Promise((resolve, reject) => {
      var options,
          request;

      options = _this.getOptions(inputs);

      request = http.request(options, (response) => {
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
   * Formats the options object for the http.request
   *
   * @param inputs {Object}
   *        an object with all the required query params
   *
   * @return {Object}
   *        a formatted http.request options object
   */
  _this.getOptions = function (inputs) {
    var options;

    options = {
      'hostname': _this.hostname,
      'port': _this.port,
      'path': _this.pathname + _this.urlEncode(inputs)
    };

    return options;
  };

  /**
   * URL encode an object.
   *
   * @param obj {Object}
   *      object to encode
   *
   * @return {String}
   *      url encoded object
   */
  _this.urlEncode = function (obj) {
    return obj.design_code + '/' + obj.site_class + '/' + obj.risk_category +
        '/' + obj.longitude + '/' + obj.latitude + '/' + obj.title;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = LegacyFactory;
