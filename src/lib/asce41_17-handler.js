'use strict';


const ASCE41_17Factory = require('./asce41_17-factory'),
    ASCE41Handler = require('./asce41-handler'),
    extend = require('extend');

const _DEFAULTS = {
  factory: ASCE41_17Factory,
  referenceDocument: 'ASCE41-17'
};


const ASCE41_17Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE41Handler(options);


  options = null;
  return _this;
};


module.exports = ASCE41_17Handler;
