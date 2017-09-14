'use strict';


const ASCE41_13Factory = require('./asce41_13-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'ASCE41-17'
};


/**
 * Class: ASCE41_17Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const ASCE41_17Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE41_13Factory(options);


  options = null;
  return _this;
};


module.exports = ASCE41_17Factory;