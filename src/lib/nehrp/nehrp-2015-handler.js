'use strict';


const NEHRP2015Factory = require('./nehrp-2015-factory'),
    NSHMHandler = require('../basis/nshm-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: NEHRP2015Factory,
  referenceDocument: 'NEHRP-2015'
};


/**
 * Handler for ASCE7-16 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const NEHRP2015Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMHandler(options);


  options = null;
  return _this;
};


module.exports = NEHRP2015Handler;
