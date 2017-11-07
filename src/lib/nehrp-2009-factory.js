'use strict';


const NSHM2008Factory = require('./nshm_2008-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'NEHRP-2009'
};


/**
 * Class: NHERP2009Factory
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
const NEHRP2009Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHM2008Factory(options);


  options = null;
  return _this;
};


module.exports = NEHRP2009Factory;
