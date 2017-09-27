'use strict';


const NEHRP2009Factory = require('./nehrp2009-factory'),
    ASCE7Handler = require('./asce7-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: NEHRP2009Factory,
  referenceDocument: 'NEHRP2009'
};


/**
 * Handler for NEHRP2009Handler web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const NEHRP2009Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Handler(options);


  options = null;
  return _this;
};


module.exports = NEHRP2009Handler;
