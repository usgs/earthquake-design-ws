'use strict';


var extend = require('extend'),
    http = require('http'),
    https = require('https'),
    querystring = require('querystring'),
    url = require('url');


var _DEFAULTS;

_DEFAULTS = {
  url: 'https://earthquake.usgs.gov/ws'
};


/**
 * Generalized class for accessing external web services.
 *
 */
var WebServiceAccessor = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    var params;

    options = extend({}, _DEFAULTS, options);

    // parse url to get web service details
    params = url.parse(options.url);

    _this.hostname = params.hostname;
    _this.pathname = params.pathname;

    if (params.port) {
      _this.port = params.port;
    } else {
      // use protocol when no port is defined
      if (params.protocol === 'https:') {
        _this.port = 443;
      } else {
        _this.port = 80;
      }
    }
  };


  /**
   * Free references.
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
   * Query the web service and return results
   *
   * @param inputs {object}
   *     parameters to provided to web service
   *
   * @return {Promise}
   *     A promise that resolves with the web service response or rejects
   *     if an error occurs.
   */
  _this.getData = function (inputs) {
    return _this.getRequestOptions(inputs).then((requestOptions) => {
      return _this.request(requestOptions);
    });
  };

  _this.getHostname = function () {
    return _this.hostname;
  };

  _this.getPath = function () {
    return _this.pathname;
  };

  _this.getPort = function () {
    return _this.port;
  };

  _this.getQueryString = function (inputs) {
    var buffer,
        key,
        value;

    buffer = [];

    for (key in inputs) {
      value = inputs[key];
      buffer.push(querystring.escape(key) + '=' + querystring.escape(value));
    }

    // Include the '?' in the result so implementing sub-classes may choose
    // to use canonical URLs (with rewrites) instead of true query strings.
    return '?' + buffer.join('&');
  };

  /**
   * Gets an object with request data that can be provided to a client.
   *
   * @param inputs {Object}
   *     An object containing inputs required for the target web service.
   */
  _this.getRequestOptions = function (inputs) {
    return new Promise((resolve, reject) => {
      try {
        return resolve({
          'hostname': _this.getHostname(),
          'port': _this.getPort(),
          'path': _this.getPath() + _this.getQueryString(inputs)
        });
      } catch (e) {
        return reject(e);
      }
    });
  };

  /**
   * Makes a request to the web service.
   *
   * @param requestOptions {Object}
   *     Options suitable for making the request with a client (http or https).
   *
   * @return {Promise}
   *     Promise with web service results parsed as a JSON object.
   */
  _this.request = function (requestOptions) {
    return new Promise((resolve, reject) => {
      var client,
          request;

      client = (requestOptions.port === 443) ? https : http;

      request = client.request(requestOptions, (response) => {
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


  _initialize(options);
  options = null;
  return _this;
};


module.exports = WebServiceAccessor;
