'use strict';


const NSHM2014Factory = require('../basis/nshm_2014-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'ASCE7-16'
};


/**
 * Class: ASCE7_16Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const ASCE7_16Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHM2014Factory(options);


  options = null;
  return _this;
};


module.exports = ASCE7_16Factory;
