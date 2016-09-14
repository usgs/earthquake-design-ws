'use strict';


var DesignFactory = require('./design-factory'),
    DesignHandler = require('../handler/design-handler'),
    DeterministicHazardFactory = require('./deterministic-hazard-factory'),
    express = require('express'),
    extend = require('extend'),
    LegacyFactory = require('./legacy-factory'),
    MetadataFactory = require('./metadata-factory'),
    ProbabilisticHazardFactory = require('./probabilistic-hazard-factory'),
    RiskTargetingFactory = require('./risk-targeting-factory'),
    SiteAmplificationFactory = require('./site-amplification-factory');


var _DEFAULTS;

_DEFAULTS = {
  MOUNT_PATH: '',
  PORT: 8000,
  LEGACY_URL: '/legacy/service'
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
      _handlers,
      _legacyFactory,
      _mountPath,
      _port;


  _this = {};

  /**
   * Creates the connection pool and routing handlers for the service.
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _docRoot = options.webDir;
    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;

    _legacyFactory = LegacyFactory({
      url: options.LEGACY_URL
    });

    // Setup handler and pass in factory
    _handlers = {
      'design.json': _this.createDesignHandler
    };
  };

  _this.createDesignFactory = function () {
    return DesignFactory({
      deterministicHazardFactory: DeterministicHazardFactory(
          {legacyFactory: _legacyFactory}),
      metadataFactory: MetadataFactory(
          {legacyFactory: _legacyFactory}),
      probabilisticHazardFactory: ProbabilisticHazardFactory(
          {legacyFactory: _legacyFactory}),
      riskTargetingFactory: RiskTargetingFactory(
          {legacyFactory: _legacyFactory}),
      siteAmplificationFactory: SiteAmplificationFactory()
    });
  };

  _this.createDesignHandler = function () {
    return DesignHandler({
      designFactory: _this.createDesignFactory()
    });
  };

  /**
   * Frees resources associated with service.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _legacyFactory.destroy();

    _docRoot = null;
    _handlers = null;
    _legacyFactory = null;
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
    if (!(method in _handlers)) {
      return next();
    }

    _this.setHeaders(response);

    try {
      handler = _handlers[method]();

      handler.get(request.query)
        .then((data) => {
          _this.onSuccess(data, request, response, next);
        })
        .catch((err) => {
          _this.onError(err, request, response, next);
        })
        .then(() => {
          handler.destroy();
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
    var params;

    params = request.query || {};

    ['latitude', 'longitude'].forEach((key) => {
      if (params.hasOwnProperty(key)) {
        params[key] = parseFloat(params[key]);
      }
    });

    return {
      date: new Date().toISOString(),
      status: isSuccess ? 'success' : 'error',
      url: request.protocol + '://' + request.hostname + request.originalUrl,
      parameters: params
    };
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
    if (request) {
      process.stderr.write('url=' + request.originalUrl);
    }
    if (err && err.stack) {
      process.stderr.write(err.stack);
    }

    response.status((err && err.status) ? err.status : 500);
    response.json({
      data: (err && err.message) ? err.message : 'internal server error',
      metadata: _this.getResponseMetadata(request, false)
    });
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
    if (data === null) {
      return next();
    }

    response.json({
      metadata: _this.getResponseMetadata(request, true),
      data: data
    });
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

    // handle dynamic requests
    app.get(_mountPath + '/:method', _this.get);

    // rest fall through to htdocs as static content.
    app.use(_mountPath, express.static(_docRoot));

    app.listen(_port, function () {
      process.stderr.write('WebService listening ' +
          'http://localhost:' + _port + _mountPath + '\n');
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = WebService;
