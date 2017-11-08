'use strict';


const NSHMFactory = require('./nshm-factory'),
    VerticalCoefficientFactory = require('../component/vertical-coefficient-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'NSHM_2014' // junk default
};


/**
 * Class: NSHM_2014-Factory
 *
 * @param options Object
 *     Configuration options for this instance.
 */
const NSHM2014Factory = function (options) {
  let _this,
      _initialize,

      _get;


  options = extend({}, _DEFAULTS, options);
  _this = NSHMFactory(options);

  _initialize = function(options) {
    _this.verticalCoefficientFactory = options.verticalCoefficientFactory;
    if (!_this.verticalCoefficientFactory) {
      _this.destoryVerticalCoefficientFactory = true;
      _this.verticalCoefficientFactory = VerticalCoefficientFactory();
    }
  };


  _this.destroy = function() {
    if (_this === null) {
      return;
    }

    if (_this.destroyVerticalCoefficientFactory) {
      _this.verticalCoefficientFactory.destroy();
    }
  };

  _get = _this.get;
  _this.get = function(inputs) {
    let result;
    return _get.call(_this, inputs).then((data) => {
      result = data;
      return _this.verticalCoefficientFactory.getVerticalCoefficientData({
        ss:result.basicDesign.ss,
        referenceDocument: _this.referenceDocument,
        siteClass: inputs.siteClass
      });
    }).then((verticalCoefficientResult) => {
      result.cv = verticalCoefficientResult.cv;
      return _this.spectraFactory.getVerticalSpectrum(result.finalDesign.sms,
          result.finalDesign.sm1, result.cv);
    }).then((samvRawSpectrum) => {
      let samvSpectrum,
          savSpectrum;
      samvSpectrum = [];
      savSpectrum = [];

      // SaMv = shall not be less than one-half of the corresponding SaM
      // for horizontal components determined in accordance with the general or
      // site-specific procedures of Section 11.4 or Chapter 21, respectively.
      for (let i = 0; i < samvRawSpectrum.length; i++) {
        let sam,
            samv,
            samvRaw,
            sav;

        // Samv calulation
        sam = result.spectra.smSpectrum[i];
        samvRaw = samvRawSpectrum[i];

        if (sam[0] !== samvRaw[0]) {
          throw new Error('Expected x values to match.');
        }

        samv = [
          sam[0],
          Math.max(samvRaw[1], 0.5 * sam[1])
        ];

        samvSpectrum.push(samv);

        // Sav Calculation
        sav = [samv[0], (2/3) * samv[1]];

        savSpectrum.push(sav);
      }

      result.samvSpectrum = samvSpectrum;
      result.savSpectrum = savSpectrum;

      return result;
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = NSHM2014Factory;
