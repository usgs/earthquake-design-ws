'use strict';


const ASCE7_05Factory = require('./asce7_05-factory'),
    ASCE7Handler = require('./asce7-handler'),
    extend = require('extend');

const _DEFAULTS = {
  factory: ASCE7_05Factory,
  referenceDocument: 'ASCE7_05'
};


const ASCE7_05Handler = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = ASCE7Handler(options);


  options = null;
  return _this;
};


module.exports = ASCE7_05Handler;
