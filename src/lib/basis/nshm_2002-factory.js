'use strict';


const NSHMFactory = require('./nshm-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'NSHM_2002' // junk default
};


/**
 * Class: NSHM_2002Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const NSHM_2002Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMFactory(options);


  options = null;
  return _this;
};


module.exports = NSHM_2002Factory;
