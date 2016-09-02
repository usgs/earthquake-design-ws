'use strict';


var express = require('express'),
    extend = require('extend'),
    pgp = require('pg-promise')();


var _DEFAULTS;

_DEFAULTS = {
  DB_HOST: 'localhost',
  DB_NAME: 'database',
  DB_PASS: 'password',
  DB_PORT: 1234,
  DB_USER: 'username',
  MOUNT_PATH: '/',
  PORT: 8000
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

      _db,
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

    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;

    _db = pgp({
      host: options.DB_HOST,
      port: options.DB_PORT,
      database: options.DB_NAME,
      user: options.DB_USER,
      password: options.DB_PASS,
      pool: 100
    });

    // TODO, setup handler and pass in factory
  };


  /**
   * Frees resources associated with service.
   *
   */
  _this.destroy = function () {

    if (_db) {
      _db.end();
    }

    _db = null;
    _mountPath = null;
    _port = null;

    _initialize = null;
    _this = null;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = WebService;
