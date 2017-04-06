'use strict';

var extend = require('extend'),
    pg = require('pg');

// Set up data parsers for data returned by queries
require('./data-parsers');

var _DEFAULTS;

_DEFAULTS = {
  DB_DATABASE: 'postgres',
  DB_HOST: 'localhost',
  DB_PASSWORD: null,
  DB_PORT: 5432,
  DB_SCHEMA: 'public',
  DB_USER: null
};


/**
 * An abstraction layer around a database pool. The purpose for this is to
 * set the search_path on the underlying connection used by the pool for a
 * given query prior to executing the query. This allows queries to be
 * unscoped (with regard to schema) and still succeed.
 *
 * @param options {Object}
 * @parma options.DB_DATABASE {String}
 * @parma options.DB_HOST {String}
 * @parma options.DB_PASSWORD {String}
 * @parma options.DB_PORT {Integer}
 * @parma options.DB_SCHEMA {String}
 * @parma options.DB_USER {String}
 */
var Pool = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.setSearchPathQuery =
        `SET search_path = ${options.DB_SCHEMA}`;

    _this.pool = options.pool;

    if (!_this.pool) {
      _this.destroyPool = true;
      _this.pool = new pg.Pool({
        database: options.DB_DATABASE,
        host: options.DB_HOST,
        password: options.DB_PASSWORD,
        port: parseInt(options.DB_PORT, 10),
        user: options.DB_USER
      });
    }
  };

  /**
   * Frees resources associated with this Pool. Ends the underlying pg.Pool
   * as well as anything else.
   *
   * @return {Promise}
   *     A promise that resolves once the pool has ended.
   */
  _this.destroy = function () {
    var poolEnd;

    if (_this === null) {
      return Promise.resolve();
    }

    if (_this.destroyPool) {
      poolEnd = new Promise((resolve, reject) => {
        _this.pool.end((err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    } else {
      poolEnd = Promise.resolve();
    }

    _initialize = null;
    _this = null;

    return poolEnd;
  };

  /**
   * Executes a specific query and returns results in a promise. Conforms to
   * the existing pg.Pool#query method signature (in Promise form only). This
   * method sets the search_path on the underlying connection client prior to
   * executing the requested statement.
   *
   * @param statement {Mixed}
   *     An SQL query string (possibly with bound parameter placeholders) or
   *     a pg.Query object.
   * @param parameters {Array} Optional
   *     An array of parameters to bind to the parameter placeholders in the
   *     given `statement`.
   *
   * @return {Promise}
   *     A promise that resolves with the result of the query or rejects with
   *     an error.
   */
  _this.query = function (statement, parameters) {
    return _this.pool.connect().then((client) => {
      return client.query(_this.setSearchPathQuery).then(() => {
        return client.query(statement, parameters);
      }).then((result) => {
        return {
          result: result
        };
      }).catch((err) => {
        return {
          err: err
        };
      }).then((status) => {
        // Seems to be okay even though the `result` may still get used later
        client.release();
        if (status.err) {
          throw status.err; // Propagate the error out
        } else {
          return status.result; // Return the query results
        }
      });
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Pool;