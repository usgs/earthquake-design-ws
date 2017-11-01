'use strict';


const extend = require('extend'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    querystring = require('querystring'),
    url = require('url');


const _DEFAULTS = {
  epsilon: 1E-4
};


const QCRunner = function (options) {
  let _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.epsilon = options.epsilon;
  };


  _this._buildRequest = function (location, endpoint) {
    let parsedUrl,
        path,
        port;

    parsedUrl = url.parse(endpoint);
    port = parsedUrl.port;

    if (parsedUrl.port) {
      port = parsedUrl.port;
    } else {
      if (parsedUrl.protocol === 'https:') {
        port = 443;
      } else {
        port = 80;
      }
    }

    path = parsedUrl.pathname + '?' +
        querystring.stringify(location.request.parameters);

    return Promise.resolve({
      hostname: parsedUrl.hostname,
      port: port,
      path: path
    });
  };

  _this._compareResult = function (actual, expected) {
    let result;

    result = {
      pass: true,
      data: {}
    };

    for (let key in expected) {
      let actualVal,
          comparePass,
          expectedVal;

      if (key === 'siteClass' || key === 'hazardLevel') {
        result.data[key] = expected[key];
        continue; // skip these
      }

      actualVal = actual[key];
      expectedVal = expected[key];

      comparePass = _this._compareValue(actualVal, expectedVal);

      if (comparePass) {
        result.data[key] = actualVal;
      } else {
        result.pass = false;
        result.data[key] = {
          actual: actualVal,
          expected: expectedVal
        };
      }
    }

    return result;
  };

  _this._compareValue = function (actual, expected, epsilon) {
    if (typeof epsilon === 'undefined') {
      epsilon = _this.epsilon;
    }

    if (typeof expected === 'undefined') {
      return (typeof actual === 'undefined');
    } else if (expected === null) {
      return actual === null;
    } else if (isNaN(expected)) {
      return isNaN(actual) && (actual === expected);
    } else {
      return Math.abs(actual - expected) <= _this.epsilon;
    }
  };

  /**
   *
   * @param location {Object}
   *     An object containing parameters to make request(s) for the a
   *     location.
   * @param endpoint {String}
   *     The endpoint to make the request against.
   *
   * @return {Promise}
   *     A promise that resolves with the result for this test.
   */
  _this._runTest = function (test, endpoint) {
    let expected,
        result,
        title;

    title = test.request.parameters.title + ' (' +
        test.request.parameters.latitude + ', ' +
        test.request.parameters.longitude + ') Site Class ' +
        test.request.parameters.siteClass;

    if (test.request.parameters.hasOwnProperty('riskCategory')) {
      title += ', Risk Category: ' +
          test.request.parameters.riskCategory;
    }

    if (test.request.parameters.hasOwnProperty('customProbability')) {
      title += ', Custom Probability: ' +
          test.request.parameters.customProbability;
    }

    expected = test.response.data;
    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    result = {
      title: title,
      pass: 0,
      fail: 0,
      data: []
    };

    return _this._buildRequest(test, endpoint)
      .then((request) => {
        return _this._sendRequest(request);
      }).then((wsResponse) => {
        let actual;

        actual = wsResponse.response.data;
        if (!Array.isArray(actual)) {
          actual = [actual];
        }

        expected.forEach((expectedResult, index) => {
          let actualResult,
              comparison;

          actualResult = actual[index];
          comparison = _this._compareResult(actualResult, expectedResult);

          if (comparison.pass) {
            result.pass++;
          } else {
            result.fail++;
          }

          result.data.push(comparison);
        });

        return result;
      });
  };

  _this._sendRequest = function (options) {
    return new Promise((resolve, reject) => {
      let client,
          request;

      client = (options.port === 443) ? https : http;

      request = client.request(options, (response) => {
        let buffer;

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

  _this._writeFooter = function (fd, summary) {
    fs.writeSync(fd, '\n\n### Summary\n');
    fs.writeSync(fd, ` - :green_heart: ${summary.pass} passing\n`);
    fs.writeSync(fd, ` - :broken_heart: ${summary.fail} failing\n`);
  };

  _this._writeHeader = function (fd, endpoint) {
    let stamp,
        title;

    title = path.basename(endpoint, '.json').toUpperCase();
    stamp = (new Date()).toUTCString();

    fs.writeSync(fd, `# ${title} Quality Control Tests +/- ${_this.epsilon}\n`);
    fs.writeSync(fd, `> Generated: ${stamp}\n`);
    fs.writeSync(fd, `> Using web service: ${endpoint}\n\n`);

    fs.writeSync(fd, '### Legend\n');
    fs.writeSync(fd, ' - :green_heart: Passing\n');
    fs.writeSync(fd, ' - :broken_heart: Failing\n\n');
  };

  _this._writeResult = function (fd, result) {
    fs.writeSync(fd, `\n## ${result.title}\n`);

    result.data.forEach((item) => {
      let icon;

      if (item.pass) {
        icon = ':green_heart:';
      } else {
        icon = ':broken_heart:';
      }

      fs.writeSync(fd, ` - ${icon} ` + JSON.stringify(item.data) + '\n');
    });
  };


  /**
   *
   * @param endpoint {String}
   *     Endpoint from where to fetch data.
   * @param input {Array}
   *     Array containing objects with data data.
   *
   * @return {Promise}
   *     A promise that resolve with the summary (pass/fail) of the QC tests.
   */
  _this.run = function (endpoint, input, output) {
    let promise,
        results;

    promise = Promise.resolve();
    results = [];

    // Run each location in serial. Doing them in parallel overloads the server
    input.forEach((location) => {
      promise = promise.then(() => {
        return _this._runTest(location, endpoint);
      }).then((result) => {
        results.push(result);
      });
    });

    promise = promise.then(() => {
      let doCloseFile,
          fileDescriptor,
          summary;

      summary = {
        endpoint: endpoint,
        pass: 0,
        fail: 0
      };

      if (output.hasOwnProperty('fd')) {
        fileDescriptor = output.fd;
        doCloseFile = false;
      } else {
        fileDescriptor = fs.openSync(output, 'w');
        doCloseFile = true;
      }
      _this._writeHeader(fileDescriptor, endpoint);

      results.forEach((result) => {
        _this._writeResult(fileDescriptor, result);

        summary.pass += result.pass;
        summary.fail += result.fail;
      });

      _this._writeFooter(fileDescriptor, summary);

      if (doCloseFile) {
        fs.closeSync(fileDescriptor);
      }
      return summary;
    });

    return promise;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = QCRunner;
