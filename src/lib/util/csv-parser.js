'use strict';


var byline = require('byline'),
    extend = require('extend'),
    UrlStream = require('./url-stream'),
    zlib = require('zlib');


var _DEFAULTS;

_DEFAULTS = {
  'stream': null,
  'url': null
};


/**
 * Parser for CSV data.
 *
 * Expects a CSV stream containing 1 header line.
 * Values must not have spaces around commas.
 *
 * @param options {Object}
 * @param options.stream {ReadableStream}
 *        stream containing CSV data to parse.
 * @param options.url {String}
 *        url with CSV data to parse.
 */
var CsvParser = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    var ungzip;

    options = extend(true, {}, _DEFAULTS, options);

    _this.data = [];
    _this.headers = null;

    if (options.stream) {
      _this.stream = options.stream;
    } else {
      _this.stream = UrlStream({
        url: options.url
      });
      if (options.url.endsWith('.gz')) {
        ungzip = zlib.createGunzip();
        // forward error events in pipeline
        _this.stream.on('error', (err) => {
          ungzip.emit('error', err);
        });
        _this.stream = _this.stream.pipe(ungzip);
      }
    }
  };


  /**
   * Free references.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    if (_this.stream && typeof _this.stream.destroy === 'function') {
      _this.stream.destroy();
    }

    _this = null;
    _initialize = null;
  };

  /**
   * Callback method to handle one parsed CSV line.
   *
   * Override this method to process as a stream.
   * By default, buffers all objects in an array which is then resolved
   * in the Promise returned by #parse().
   *
   * @param obj {Object}
   *        parsed line as object.
   *        header values are keys, line values are values.
   */
  _this.onData = function (obj) {
    _this.data.push(obj);
  };


  /**
   * Parse CSV.
   *
   * Override #onData() to process lines as they are parsed.
   *
   * @return {Promise}
   *         resolved with array of parsed data when parsing is complete.
   *         rejected if errors occur during parsing.
   */
  _this.parse = function () {
    return new Promise((resolve, reject) => {
      var s;

      // create stream
      s = byline.createStream();

      // do parsing
      s.on('data', (line) => {
        try {
          _this.parseLine(line);
        } catch (e) {
          s = null;
          _this.destroy();

          reject(e);
        }
      });
      s.on('end', () => {
        var data;

        if (_this) {
          s = null;
          data = _this.data;
          _this.destroy();

          resolve(data);
        }
      });

      s.on('error', function (err) {
        s = null;
        _this.destroy();

        reject(err);
      });

      // forward error events in pipeline
      _this.stream.on('error', (err) => {
        s.emit('error', err);
      });
      s = _this.stream.pipe(s);
    });
  };

  /**
   * Parse header line.
   *
   * @param line {String} line to parse.
   */
  _this.parseHeaders = function (line) {
    var headers;

    // convert to string
    headers = _this._splitLine(line);

    _this.headers = headers;
  };

  /**
   * Parse line from CSV.
   *
   * If headers not set, parse headers, otherwise parse values.
   *
   * @param line {String}
   */
  _this.parseLine = function (line) {
    var headers,
        obj;

    headers = _this.headers;
    if (headers === null) {
      _this.parseHeaders(line);
      return;
    }

    // parse values
    line = _this._splitLine(line);
    if (line.length !== headers.length) {
      throw new Error('header column (' + headers.length + ')'
        + ' and line column (' + line.length + ') mismatch');
    }

    // create object combining headers and values.
    obj = {};
    headers.forEach((h, i) => {
      obj[h] = line[i];
    });
    _this.onData(obj);
  };

  /**
   * Split a line into components.
   *
   * @param line {String}
   *        line to split.
   * @return {Array<String>}
   *.        columns after split.
   */
  _this._splitLine = function (line) {
    var parts,
        value,
        values;

    values = [];
    value = null;
    parts = ('' + line).split(',');
    parts.forEach((p) => {
      if (value === null) {
        // not in a value
        value = p;
      } else {
        value += ',' + p;
      }

      if (value.startsWith('"')) {
        if (value.endsWith('"')) {
          // quoted value, remove quotes and move on
          value = value.substring(1, value.length - 1);
          values.push(value);
          value = null;
        }
      } else {
        values.push(value.trim());
        value = null;
      }
    });

    if (value !== null) {
      throw new Error('Incomplete value, missing closing quote');
    }

    return values;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = CsvParser;
