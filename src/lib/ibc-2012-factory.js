'use strict';


const NSHM2008Factory = require('./nshm_2008-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'IBC-2012'
};


/**
 * Class: IBC2012Factory
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
const IBC2012Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHM2008Factory(options);


  options = null;
  return _this;
};


module.exports = IBC2012Factory;
