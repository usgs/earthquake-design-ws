'use strict';


const IBC2015Factory = require('./ibc-2015-factory'),
    ASCE7Handler = require('./asce7-handler'),
    extend = require('extend');


const _DEFAULTS = {
  factoryConstructor: IBC2015Factory,
  referenceDocument: 'IBC-2015'
};


/**
 * Handler for ASCE7-10 web service validates parameters and calls
 * factory with params.
 *
 * @param options {Object}
 *    Configuration options
 */
const IBC2015Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Handler(options);


  options = null;
  return _this;
};


module.exports = IBC2015Handler;
