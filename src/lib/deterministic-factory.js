'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {

};


var DeterministicFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.db = options.db;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  _this.computeResult = function (metadata, data) {
    var pgad,
        s1d,
        ssd;

    pgad = data.mapped_pgad * metadata.percentile_pgad;
    s1d = data.mapped_s1d * metadata.percentile_s1d;
    ssd = data.mapped_ssd * metadata.percentile_ssd;

    data.pgad = Math.max(pgad, metadata.floor_pgad);
    data.s1d = Math.max(s1d, metadata.floor_s1d);
    data.ssd = Math.max(ssd, metadata.floor_ssd);

    return Promise.resolve({
      'data': data,
      'metadata': metadata
    });
  };

  _this.getDeterministicData = function (inputs) {
    return _this.getMetadata(inputs).then((metadata) => {
      return _this.getMappedData(metadata, inputs).then((data) => {
        return _this.computeResult(metadata, data);
      });
    });
  };

  _this.getMappedData = function (/*metadata, inputs*/) {
    // TODO :: Use _this.db to query mapped data from database
    return Promise.resolve({
      'mapped_ssd': 0.0,
      'mapped_s1d': 0.0,
      'mapped_pgad': 0.0
    });
  };

  _this.getMetadata = function (/*inputs*/) {
    // TODO :: Use _this.db to query metadata from database
    return Promise.resolve({
      'dataset': 'Some Dataset',
      'percentile_ssd': 1.8,
      'percentile_s1d': 1.8,
      'percentile_pgad': 1.8,
      'floor_ssd': 1.5,
      'floor_s1d': 0.6,
      'floor_pgad': 0.6
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = DeterministicFactory;
