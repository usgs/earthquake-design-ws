'use strict';


const ASCE7_10Factory = require('./asce7_10-factory'),
    NSHMHandler = require('../basis/nshm-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: ASCE7_10Factory,
  referenceDocument: 'ASCE7-10'
};


/**
 * Handler for ASCE7-10 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const ASCE7_10Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMHandler(options);


  options = null;
  return _this;
};


module.exports = ASCE7_10Handler;
