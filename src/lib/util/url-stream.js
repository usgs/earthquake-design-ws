'use strict';


var extend = require('extend'),
    libcurl = require('node-libcurl'),
    stream = require('stream');


var _DEFAULTS;

_DEFAULTS = {
  'url': null
};


/**
 * Create a new Readable stream from a URL.
 *
 * @param options {Object}
 * @param options.url {String}
 *
 * @emits "data" - event from libcurl
 * @emits "end" - event from libcurl
 * @emits "error" - event from libcurl
 * @emits "header" - event from libcurl
 *
 * @return {stream.Readable}
 *.        a readable stream of data from given URL.
 */
var UrlStream = function (options) {
  var _this,
      _initialize;

  _this = new stream.Readable();

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.curl = null;
    _this.url = options.url;
  };

  /**
   * Close any active request and free resources.
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    if (_this.curl) {
      _this.curl.close();
      _this.curl = null;
    }

    _this = null;
  };

  /**
   * Read URL data using a Promise.
   *
   * Object is automatically destroyed when Promise resolves/rejects.
   *
   * @return {Promise}
   *         Promise representing data from URL.
   *         resolve with data.
   *         reject with error.
   */
  _this.readPromise = function () {
    return new Promise((resolve, reject) => {
      var buf,
          destroy,
          writable;

      destroy = function () {
        buf = null;
        writable = null;
        _this.destroy();
      };

      buf = [];
      writable = stream.Writable();

      writable._write = function (chunk, enc, cb) {
        buf.push(chunk);
        cb();
      };

      writable.on('finish', function () {
        var data;
        data = buf.join('');
        destroy();
        resolve(data);
      });

      writable.on('error', function (err) {
        destroy();
        reject(err);
      });

      _this.pipe(writable);
    });
  };

  /**
   * Implement stream.Readable.
   *
   * Starts curl request, handles curl events.
   */
  _this._read = function () {
    var curl,
        destroy;

    if (_this.curl !== null) {
      // already running
      return;
    }

    destroy = function () {
      // free curl handle
      _this.curl.close();
      _this.curl = null;
    };

    // create curl handle
    curl = new libcurl.Curl();
    curl.setOpt('URL', _this.url);

    // put data into Readable stream
    curl.on('data', (d) => {
      // add to stream buffer
      _this.push(d);
    });

    // destroy when finished
    curl.on('end', () => {
      // mark end of stream
      _this.push(null);
      destroy();
    });

    // pass "error" events through
    curl.on('error', (e) => {
      destroy();
      _this.emit('error', e);
    });

    // pass "header" events through
    curl.on('header', (h) => {
      _this.emit('header', h);
    });

    // start request
    _this.curl = curl;
    curl.perform();
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = UrlStream;
