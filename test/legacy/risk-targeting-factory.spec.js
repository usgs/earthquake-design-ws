/* global describe, it */
'use strict';


var RiskTargetingFactory = require('../../src/lib/legacy/risk-targeting-factory'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _LEGACY_FACTORY,
    _LEGACY_RESULT;

_LEGACY_RESULT = require('./legacy-result');

_LEGACY_FACTORY = {
  getLegacyData: () => {
    return Promise.resolve(_LEGACY_RESULT);
  }
};


describe('RiskTargetingFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof RiskTargetingFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(RiskTargetingFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = RiskTargetingFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('formatResult', () => {
    it('rejects with an error when receiving unexpected input', (done) => {
      var factory;

      factory = RiskTargetingFactory();

      factory.formatResult().then((/*result*/) => {
        var error;

        error = new Error('Method resolved but should have rejected!');
        error.assertionFailed = true; // Flag to distinguish this error

        throw error;
      }).catch((err) => {
        if (err.assertionFailed) {
          return err;
        }
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });

    it('resolves with proper object keys', (done) => {
      var factory;

      factory = RiskTargetingFactory();

      factory.formatResult(_LEGACY_RESULT).then((result) => {
        expect(result.hasOwnProperty('crs')).to.equal(true);
        expect(result.hasOwnProperty('cr1')).to.equal(true);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });

  describe('getRiskCoefficients', () => {
    it('returns a promise', () => {
      var factory,
          promise;

      factory = RiskTargetingFactory({
        legacyFactory: _LEGACY_FACTORY
      });

      promise = factory.getRiskCoefficients();

      expect(promise).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls sub methods', (done) => {
      var factory;


      factory = RiskTargetingFactory({
        legacyFactory: _LEGACY_FACTORY
      });

      sinon.stub(factory, 'formatResult').callsFake(() => {});
      sinon.spy(factory.legacyFactory, 'getLegacyData');

      factory.getRiskCoefficients().then(() => {
        expect(factory.legacyFactory.getLegacyData.callCount).to.equal(1);
        expect(factory.formatResult.callCount).to.equal(1);

        // Note: By not returning anything here we skip the next "catch" and
        //       go straight to the next "then" which will call done with
        //       "undefined" which implies "success" to mocha.
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.legacyFactory.getLegacyData.restore();
        factory.formatResult.restore();
        factory.destroy();
        done(err);
      });
    });
  });
});
