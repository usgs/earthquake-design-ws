'use strict';


var extend = require('extend'),
    GriddedDataHandler = require('./gridded-data-handler');


var _DEFAULTS;

_DEFAULTS = {
  DB_SCHEMA: 'probabilistic'
};


var ProbabilisticHandler = function (options) {
  var _this;


  options = extend(true, {}, _DEFAULTS, options);
  if (options.hasOwnProperty('DB_SCHEMA_PROBABILISTIC')) {
    options.DB_SCHEMA = options.DB_SCHEMA_PROBABILISTIC;
  }
  _this = GriddedDataHandler(options);


  // Override any API or Helper methods from GriddedDataHander as needed.
  // ...


  options = null;
  return _this;
};


module.exports = ProbabilisticHandler;
