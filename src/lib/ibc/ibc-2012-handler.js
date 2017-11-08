'use strict';


const IBC2012Factory = require('./ibc-2012-factory'),
    NSHMHandler = require('../basis/nshm-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: IBC2012Factory,
  referenceDocument: 'IBC-2012'
};


/**
 * Handler for ASCE7-10 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const IBC2012Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMHandler(options);


  options = null;
  return _this;
};


module.exports = IBC2012Handler;
