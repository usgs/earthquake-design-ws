'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
};


var DesignFactory = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _this.metadataFactory = options.metadataFactory;
    _this.probabilisticHazardFactory = options.probabilisticHazardFactory;
    _this.deterministicHazardFactory = options.deterministicHazardFactory;
    _this.riskTargetingFactory = options.riskTargetingFactory;
    _this.siteAmplificationFactory = options.siteAmplificationFactory;
  };


  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    // TODO :: Free resources here ...

    _initialize = null;
    _this = null;
  };


  _this.computeBasicDesign = function (/*data*/) {
    return Promise.resolve({});
  };

  _this.computeFinalDesign = function (/*data*/) {
    return Promise.resolve({});
  };

  _this.formatResult = function (/*result*/) {
    return Promise.resolve({});
  };

  _this.getDesignData = function (inputs) {
    var result;

    result = {
      metadata: null,
      probabilistic: null,
      deterministic: null,
      riskCoefficients: null,
      siteAmplification: null,
      basicDesign: null,
      finalDesign: null
    };

    return Promise.all([
      _this.metadataFactory.getMetadata(inputs),
      _this.probabilisticHazardFactory.getProbabilisticData(inputs),
      _this.deterministicHazardFactory.getDeterministicData(inputs),
      _this.riskTargetingFactory.getRiskCoefficients(inputs)
    ]).then((promiseResults) => {
      // => [metadata, probabilistic, deterministic, riskCoefficients]
      result.metadata = promiseResults[0];
      result.probabilistic = promiseResults[1];
      result.deterministic = promiseResults[2];
      result.riskCoefficients = promiseResults[3];

      return _this.computeBasicDesign(result);
    }).then((basicDesign) => {
      result.basicDesign = basicDesign;

      return _this.siteAmplificationFactory.getAmplificationData(
          extend(true, {}, inputs, basicDesign));
    }).then((siteAmplification) => {
      result.siteAmplification = siteAmplification;

      return _this.computeFinalDesign(result);
    }).then((finalDesign) => {
      result.finalDesign = finalDesign;

      return _this.formatResult(result);
    });
  };




  _initialize(options);
  options = null;
  return _this;
};


module.exports = DesignFactory;
