'use strict';


var extend = require('extend');


// defaults for ajax method
var _DEFAULT_AJAX_OPTIONS = {
  url: null,
  success: null,
  error: null,
  done: null,
  method: 'GET',
  headers: null,
  data: null,
  rawdata: null
};

// API Method Declarations

var ajax,
    jsonp,
    restrictOrigin,
    urlEncode;


// API Method Definitions

/**
 * Make an AJAX request.
 *
 * @param options.url {String}
 *      the url to request.
 * @param options.success {Function}
 *      called with data loaded by script
 * @param options.error {Function} optional
 *      called when script fails to load
 * @param options.done {Function}
 *        called when ajax is complete, after success or error.
 * @param options.method {String}
 *      request method, default is 'GET'
 * @param options.headers {Object}
 *      request header name as key, value as value.
 * @param options.data {Object}
 *      request data, sent using content type
 *      'application/x-www-form-urlencoded'.
 * @param options.rawdata {?}
 *      passed directly to send method, when options.data is null.
 *      Content-type header must also be specified. Default is null.
 */
ajax = function (options) {
  var h,
      postdata,
      queryString,
      url,
      xhr;

  options = extend({}, _DEFAULT_AJAX_OPTIONS, options);
  url = options.url;

  if (options.restrictOrigin) {
    url = restrictOrigin(url);
  }
  postdata = options.rawdata;

  if (options.data !== null) {
    queryString = urlEncode(options.data);
    if (options.method === 'GET') {
      // append to url
      url = url + '?' + queryString;
    } else {
      // otherwise send as request body
      postdata = queryString;
      if (options.headers === null) {
        options.headers = {};
      }
      // set request content type
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }

  return new Promise(function(resolve, reject) {

    xhr = new XMLHttpRequest();

    // setup callback
    xhr.onreadystatechange = function () {
      var data, contentType;

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (options.success !== null) {
            try {
              data = xhr.response;
              contentType = xhr.getResponseHeader('Content-Type');
              if (contentType && contentType.indexOf('json') !== -1) {
                data = JSON.parse(data);
              }
              options.success(data, xhr);
            } catch (e) {
              if (options.error !== null) {
                options.error(e, xhr);
              }
            }
          }
        } else {
          if (options.error) {
            options.error(xhr.status, xhr);
          }
        }
        if (options.done !== null) {
          options.done(xhr);
        }
      }
    };

    // open request
    xhr.open(options.method, url, true);

    // send headers
    if (options.headers !== null) {
      for (h in options.headers) {
        xhr.setRequestHeader(h, options.headers[h]);
      }
    }

    // send data
    xhr.send(postdata);

    return resolve(xhr);
  });

};


restrictOrigin = function (url) {
  var a,
      restrictedUrl;

  a = document.createElement('a'); // Hack to parse only the pathname
  a.setAttribute('href', url);
  restrictedUrl = a.pathname;

  // Needed for IE, which omits leading slash.
  if ((url.indexOf('http') === 0 || url.indexOf('/') === 0) &&
      restrictedUrl.indexOf('/') !== 0) {
    restrictedUrl = '/' + restrictedUrl;
  }

  return restrictedUrl;
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
urlEncode = function (obj) {
  var data, key, encodedKey, value, i, len;

  data = [];
  for (key in obj) {
    encodedKey = encodeURIComponent(key);
    value = obj[key];

    if (value instanceof Array) {
      // Add each value in array seperately
      for (i = 0, len = value.length; i < len; i++) {
        data.push(encodedKey + '=' + encodeURIComponent(value[i]));
      }
    } else {
      data.push(encodedKey + '=' + encodeURIComponent(value));
    }
  }
  return data.join('&');
};


// expose the API
module.exports = {
  ajax: ajax,
  jsonp: jsonp,
  restrictOrigin: restrictOrigin,
  urlEncode: urlEncode,
};