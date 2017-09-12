'use strict';


const ASCE41_13Factory = require('./asce41_13-factory'),
    ASCE41Handler = require('./asce41-handler'),
    extend = require('extend');

const _DEFAULTS = {
  factory: ASCE41_13Factory,
  referenceDocument: 'ASCE41-13'
};


const ASCE41_13Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE41Handler(options);


  options = null;
  return _this;
};


module.exports = ASCE41_13Handler;
