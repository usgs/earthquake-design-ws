'use strict';


const ASCE7_16Handler = require('./asce7_16-handler'),
    ASCE7_10Handler = require('./asce7_10-handler'),
    ASCE7_05Handler = require('./asce7_05-handler'),
    NEHRP2015Handler = require('./nehrp2015-handler'),
    ASCE41_13Handler = require('./asce41_13-handler'),
    ASCE41_17Handler = require('./asce41_17-handler'),
    NEHRP2009Handler = require('./nehrp-2009-handler'),
    DeterministicHandler = require('./deterministic-handler'),
    express = require('express'),
    extend = require('extend'),
    fs = require('fs'),
    morgan = require('morgan'),
    ProbabilisticHander = require('./probabilistic-handler'),
    RiskCoefficientHandler = require('./risk-coefficient-handler'),
    TSubLDataHandler = require('./t-sub-l-data-handler');


const _DEFAULTS = {
  MOUNT_PATH: '',
  PORT: 8000,
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
const WebService = function (options) {
  let _this,
      _initialize;


  _this = {};

  /**
   * Creates the connection pool and routing handlers for the service.
   *
   * @param options {Object}
   */
  _initialize = function (options) {
    let endpoint;

    options = extend(true, {}, _DEFAULTS, options);

    _this.docRoot = options.webDir;
    _this.mountPath = options.MOUNT_PATH;
    _this.port = options.PORT;
    _this.revisionInfo = options.REVISION;
    _this.versionInfo = options.VERSION;

    // Setup handler and pass in factory
    if (options.handlers) {
      _this.handlers = {};

      for (endpoint in options.handlers) {
        _this.handlers[endpoint] = options.handlers[endpoint](options);
      }
    } else {
      _this.handlers = {
        'asce7-16.json': ASCE7_16Handler(options),
        'asce7-10.json': ASCE7_10Handler(options),
        'asce7-05.json': ASCE7_05Handler(options),

        'nehrp-2009.json': NEHRP2009Handler(options),
        'nehrp-2015.json': NEHRP2015Handler(options),

        'asce41-17.json': ASCE41_17Handler(options),
        'asce41-13.json': ASCE41_13Handler(options),

        'deterministic.json': DeterministicHandler(options),
        'probabilistic.json': ProbabilisticHander(options),
        'risk-coefficient.json': RiskCoefficientHandler(options),
        't-sub-l.json': TSubLDataHandler(options)
      };
    }
  };

  /**
   * Frees resources associated with service.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    for (let endpoint in _this.handlers) {
      _this.handlers[endpoint].destroy();
    }

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
    let handler,
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
   * Creates a metadata object to provide in the request body. This object
   * contains a timestamp, request URL, and a status indicator.
   *
   * @param request {Express.Request}
   *     The request for which to generate metata.
   * @param isSuccess {Boolean}
   *     Is this response representing a successful request?
   *
   * @return {Object}
   *     An object with metadata information about the request.
   */
  _this.getRequestMetadata = function (request, isSuccess) {
    let params,
        protocol,
        referenceDocument;

    request = request || {};
    params = request.query || {};

    referenceDocument = params.referenceDocument;
    delete params.referenceDocument;

    ['latitude', 'longitude', 'customProbability'].forEach((key) => {
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
    let payload,
        status;

    payload = {
      request: _this.getRequestMetadata(request, false),
      response: (err && err.message) ? err.message : 'internal server error'
    };

    status = (err && err.status) ? err.status : 500;

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
    let payload;

    if (data === null) {
      return next();
    }

    payload = {
      request: _this.getRequestMetadata(request, true),
      response: data
    };

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
    let app;

    app = express();
    app.set('json spaces', 2);

    app.use(morgan('combined'));

    // Redirect to index.html
    app.get(_this.mountPath + '$', (req, res) => {
      res.redirect(_this.mountPath + '/');
    });

    // rest fall through to htdocs as static content.
    app.get([_this.mountPath + '/', _this.mountPath + '/index.html'], (req, res) => {
      fs.readFile('src/htdocs/index.html', 'utf8', (err, data) => {
        res.send(data
          .replace('{{VERSION}}', _this.versionInfo)
          .replace('{{REVISION}}', _this.revisionInfo)
        );
      });
    });

    // handle dynamic requests
    app.get(_this.mountPath + '/:method', _this.get);

    app.use(_this.mountPath,express.static(_this.docRoot,
        {fallthrough: true}));

    // Final handler for 404 (no handler, no static file)
    app.get(_this.mountPath + '/:error', (req, res/*, next*/) => {
      let payload;

      payload = `Cannot GET ${req.path}`;
      res.status(404);
      res.send(payload);
      res.end();
    });

    app.listen(_this.port, function () {
      process.stderr.write('WebService listening ' +
          'http://localhost:' + _this.port + _this.mountPath + '/\n');
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = WebService;
