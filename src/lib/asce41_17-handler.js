'use strict';

const ASCE41_13Handler = require('./asce41_13-handler'),
    extend = require('extend');

const _DEFAULTS = {};


const ASCE41_17Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE41_13Handler(options);


  options = null;
  return _this;
};


module.exports = ASCE41_17Handler;
