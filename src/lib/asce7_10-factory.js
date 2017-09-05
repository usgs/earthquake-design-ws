'use strict';


const ASCE7Factory = require('./asce7-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'ASCE7-10'
};


/**
 * Class: ASCE7_10Factory
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
const ASCE7_10Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Factory(options);


  options = null;
  return _this;
};


module.exports = ASCE7_10Factory;
