/* global describe, it */
'use strict';

const DesignHandler = require('../src/lib/asce7_05-handler'),
    expect = require('chai').expect;


describe('asce7_05-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });
  });

  describe('formatResult', () => {
    it('returns a promise', () => {
      let handler;

      handler = DesignHandler();

      expect(handler.formatResult()).to.be.instanceof(Promise);

      handler.destroy();
    });

    it('resolves with expected data structure', (done) => {
      let handler;

      handler = DesignHandler();
      handler.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'ssuh': null,
          'ssrt': null,
          'ssd': null,
          's1d': null
        },
        'deterministic': {},
        'finalDesign': {
          'sms': null,
          'sm1': null,
          'sds': null,
          'sd1': null
        },
        'metadata': {
          'spatialInterpolationMethod': null
        },
        'probabilistic': {},
        'riskCoefficients': {
          'response': {
            'data': {}
          }
        },
        'siteAmplification': {
          'fa': null,
          'fv': null
        },
        'designCategory': {
          'sdcs': null,
          'sdc1': null,
          'sdc': null
        },
        'spectra': {
          'smSpectrum': [],
          'sdSpectrum': []
        }
      }).then((formatted) => {
        [
          'ss', 's1',
          'sms', 'sm1',
          'sds', 'sd1',
          'sdcs', 'sdc1', 'sdc',
          'fa', 'fv',
          'smSpectrum', 'sdSpectrum'
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });
        [
          'spatialInterpolationMethod'
        ].forEach((key) => {
          expect(formatted.metadata.hasOwnProperty(key)).to.equal(true);
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        handler.destroy();
        done(err);
      });
    });
  });
});

