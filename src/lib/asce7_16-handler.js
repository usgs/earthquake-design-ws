'use strict';


const ASCE7_16Factory = require('./asce7_16-factory'),
    ASCE7Handler = require('./asce7-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: ASCE7_16Factory,
  referenceDocument: 'ASCE7-16'
};


/**
 * Handler for ASCE7-16 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const ASCE7_16Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Handler(options);


  options = null;
  return _this;
};


module.exports = ASCE7_16Handler;
