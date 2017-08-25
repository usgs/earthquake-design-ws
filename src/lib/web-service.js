'use strict';
var fs = require('fs');

var ASCE7_16Handler = require('./asce7_16-handler'),
    ASCE41_13Handler = require('./asce41_13-handler'),
    DeterministicHandler = require('./deterministic-handler'),
    ProbabilisticHander = require('./probabilistic-handler'),
    RiskCoefficientHandler = require('./risk-coefficient-handler'),

    express = require('express'),
    extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  MOUNT_PATH: '',
  PORT: 8000,
  LEGACY_URL: '/legacy/service',
  REVISION: '',
  VERSION: ''
};


/**
 * @class WebService
 *
 * Sets up an express server and creates routes and handlers to deal with
 * requests.
 *
 * @param options {Object}
 *
 */
var WebService = function (options) {
  var _this,
      _initialize,

      _docRoot,
      _mountPath,
      _port,
      _revisionInfo,
      _versionInfo;


  _this = {};

  /**
   * Creates the connection pool and routing handlers for the service.
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    var endpoint;

    options = extend(true, {}, _DEFAULTS, options);

    _docRoot = options.webDir;
    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;
    _revisionInfo = options.REVISION;
    _versionInfo = options.VERSION;

    // Setup handler and pass in factory
    if (options.handlers) {
      _this.handlers = {};

      for (endpoint in options.handlers) {
        _this.handlers[endpoint] = options.handlers[endpoint](options);
      }
    } else {
      _this.handlers = {
        'asce7-16.json': ASCE7_16Handler(options),
        'asce41-13.json': ASCE41_13Handler(options),

        'deterministic.json': DeterministicHandler(options),
        'probabilistic.json': ProbabilisticHander(options),
        'risk-coefficient.json': RiskCoefficientHandler(options)
      };
    }
  };

  /**
   * Frees resources associated with service.
   *
   */
  _this.destroy = function () {
    var endpoint;

    if (_this === null) {
      return;
    }

    for (endpoint in _this.handlers) {
      _this.handlers[endpoint].destroy();
    }

    _docRoot = null;
    _mountPath = null;
    _port = null;

    _initialize = null;
    _this = null;
  };

  /**
   * Route target for dynamic GET requests.
   *
   * The request will have a `method` parameter indicating the method to
   * handle. If a handler is registered, the handler is invoked and the
   * request is served, otherwise handling is deferred to the `next`
   * middleware in the chain.
   *
   * @param request {Express.Request}
   * @param response {Express.Response}
   * @param next {Function}
   *
   */
  _this.get = function (request, response, next) {
    var handler,
        method;

    method = request.params.method;
    if (!(method in _this.handlers)) {
      return next();
    }

    _this.setHeaders(response);

    try {
      handler = _this.handlers[method];

      handler.get(request.query)
        .then((data) => {
          _this.onSuccess(data, request, response, next);
        })
        .catch((err) => {
          _this.onError(err, request, response, next);
        })
        .then(() => {
          handler = null;
        });
    } catch (err) {
      _this.onError(err, request, response, next);
    }
  };

  /**
   * Creates a metadata object to provide in the response body. This object
   * contains a timestamp, request URL, and a status indicator.
   *
   * @param request {Express.Request}
   *     The request for which to generate metata.
   * @param isSuccess {Boolean}
   *     Is this response representing a successful request?
   *
   * @return {Object}
   *     An object with metadata information about the response.
   */
  _this.getResponseMetadata = function (request, isSuccess) {
    var params,
        protocol,
        referenceDocument;

    request = request || {};
    params = request.query || {};

    referenceDocument = params.referenceDocument;
    delete params.referenceDocument;

    ['latitude', 'longitude'].forEach((key) => {
      if (params.hasOwnProperty(key)) {
        params[key] = parseFloat(params[key]);
      }
    });

    if (typeof request.get === 'function') {
      protocol = request.get('X-Forwarded-Proto');
    }

    if (!protocol) {
      protocol = request.protocol;
    }

    return {
      date: new Date().toISOString(),
      referenceDocument: referenceDocument,
      status: isSuccess ? 'success' : 'error',
      url: protocol + '://' + request.hostname + request.originalUrl,
      parameters: params
    };
  };

  _this.log = function (request, response, payload, status) {
    var ip,
        length,
        method,
        path,
        timestamp,
        userAgent;

    request = request || {};

    // Checked proxy-forwarded ip
    if (typeof request.get === 'function') {
      ip = request.get('X-Client-IP');
      if (!ip) {
        ip = request.get('X-Forwarded-For');
      }

      userAgent = request.get('User-Agent');
    }

    if (!ip) {
      ip = request.ip;
    }

    length = payload ? JSON.stringify(payload).length : '-';
    method = request.method;
    path = request.path + '?' + require('querystring').stringify(request.query);
    status = status || '-';
    timestamp = (new Date()).toUTCString();
    userAgent = userAgent || '-';

    process.stdout.write(`${ip} [${timestamp}] "${method} ${path} HTTP/1.1" ${status} ${length} "${userAgent}"\n`);
  };

  /**
   * Handles errors that occur in the handler. Sets the response code based on
   * `err.status` and the message based on `err.message`. If either of these
   * are not set, uses default status/messages instead.
   *
   * @param err {Error}
   *     The error that occurred. If err.status and/or err.message are set then
   *     they are used for the response code/message respectively.
   * @param request {Express.request}
   * @param response {Express.response}
   * @param next {Function}
   */
  _this.onError = function (err, request, response/*, next*/) {
    var payload,
        status;

    payload = {
      request: _this.getResponseMetadata(request, false),
      response: (err && err.message) ? err.message : 'internal server error'
    };

    status = (err && err.status) ? err.status : 500;

    _this.log(request, response, payload, status);

    if (err && err.stack) {
      process.stderr.write(err.stack + '\n');
    }

    response.status(status);
    response.json(payload);
  };

  /**
   * Sends the `data` encoded as a JSON string over the `response`. If no
   * data is received, the `request` falls through to be handled by the `next`
   * route in the pipeline.
   *
   * @param data {Object}
   * @param request {Express.Request}
   * @param response {Express.Response}
   * @param next {Function}
   *
   */
  _this.onSuccess = function (data, request, response, next) {
    var payload;

    if (data === null) {
      return next();
    }

    payload = {
      request: _this.getResponseMetadata(request, true),
      response: data
    };

    _this.log(request, response, payload, 200);

    response.json(payload);
  };

  /**
   * Sets CORS (and possibly other) headers on the `response`.
   *
   * @param response {Express.Response}
   */
  _this.setHeaders = function (response) {
    if (response) {
      response.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Method': '*',
        'Access-Control-Allow-Headers': [
          'accept',
          'origin',
          'authorization',
          'content-type'
        ].join(',')
      });
    }
  };

  /**
   * Start the web service in an express server.
   *
   */
  _this.start = function () {
    var app;

    app = express();

    app.get(_mountPath + '/:request', function (req, res, next) {
      process.stdout.write(`request = ${req.params.request}\n`);
      process.stdout.write(`  mountpath = ${_mountPath}\n`);
      process.stdout.write(`  docroot = ${_docRoot}\n`);
      next();
    });

    // handle dynamic requests
    app.get(_mountPath + '/:method', _this.get);

    // rest fall through to htdocs as static content.
    app.get([_mountPath, _mountPath + '/index.html'], function(req, res){
      fs.readFile('src/htdocs/index.html', 'utf8', function(err, data){
        res.send(data
            .replace('{{VERSION}}', _versionInfo)
            .replace('{{REVISION}}', _revisionInfo)
          );
      });
    });

    app.use(_mountPath, express.static(_docRoot, {fallthrough: true}));

    // Final handler for 404 (no handler, no static file)
    app.get(_mountPath + '/:error', (req, res/*, next*/) => {
      var payload;

      payload = `Cannot GET ${req.path}`;
      _this.log(req, res, payload, 404);
      res.status(404);
      res.send(payload);
      res.end();
    });

    app.listen(_port, function () {
      process.stderr.write('WebService listening ' +
          'http://localhost:' + _port + _mountPath + '/\n');
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = WebService;
