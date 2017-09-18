/* global describe, it */
'use strict';

const ASCE7_05Handler = require('../src/lib/asce7_05-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce7_05-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_05Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE7_05Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      let handler;

      handler = ASCE7_05Handler();

      expect(handler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE7-05';
      handler = ASCE7_05Handler({
        factoryConstructor: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });

  describe('formatResult', () => {
    it('returns a promise', () => {
      let handler;

      handler = ASCE7_05Handler();

      expect(handler.formatResult()).to.be.instanceof(Promise);

      handler.destroy();
    });

    it('resolves with expected data structure', (done) => {
      let handler;

      handler = ASCE7_05Handler();

      handler.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga': null,
          'ssuh': null,
          'ssrt': null,
          'ssd': null,
          's1uh': null,
          's1rt': null,
          's1d': null,
          'pgad': null
        },
        'deterministic': {},
        'finalDesign': {
          'sms': null,
          'sm1': null,
          'pgam': null,
          'sds': null,
          'sd1': null
        },
        'metadata': {
          'pgadPercentileFactor': null,
          'pgadFloor': null,

          's1MaxDirFactor': null,
          's1dPercentileFactor': null,
          's1dFloor': null,

          'ssMaxDirFactor': null,
          'ssdPercentileFactor': null,
          'ssdFloor': null
        },
        'probabilistic': {},
        'riskCoefficients': {
          'response': {
            'data': {}
          }
        },
        'siteAmplification': {
          'fa': null,
          'fa_error': null,
          'fv': null,
          'fv_error': null
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
          'fa', 'fa_error', 'fv', 'fv_error',
          'smSpectrum', 'sdSpectrum'
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });
        [
          'pgadPercentileFactor', 'pgadFloor',
          's1MaxDirFactor', 's1dPercentileFactor', 's1dFloor',
          'ssMaxDirFactor', 'ssdPercentileFactor', 'ssdFloor'
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