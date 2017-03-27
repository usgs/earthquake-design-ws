/* global describe, it */
'use strict';


var MetadataFactory = require('../../src/lib/legacy/metadata-factory'),
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


describe('MetadataFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof MetadataFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(MetadataFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = MetadataFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('formatResult', () => {
    it('rejects with an error when receiving unexpected input', (done) => {
      var factory;

      factory = MetadataFactory();

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

      factory = MetadataFactory();

      factory.formatResult(_LEGACY_RESULT).then((result) => {
        expect(result.hasOwnProperty('pgadPercentileFactor')).to.equal(true);
        expect(result.hasOwnProperty('pgadFloor')).to.equal(true);

        expect(result.hasOwnProperty('s1MaxDirFactor')).to.equal(true);
        expect(result.hasOwnProperty('s1dPercentileFactor')).to.equal(true);
        expect(result.hasOwnProperty('s1dFloor')).to.equal(true);

        expect(result.hasOwnProperty('ssMaxDirFactor')).to.equal(true);
        expect(result.hasOwnProperty('ssdPercentileFactor')).to.equal(true);
        expect(result.hasOwnProperty('ssdFloor')).to.equal(true);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });

  describe('getMetadata', () => {
    it('returns a promise', () => {
      var factory,
          promise;

      factory = MetadataFactory({
        legacyFactory: _LEGACY_FACTORY
      });

      promise = factory.getMetadata();

      expect(promise).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls sub methods', (done) => {
      var factory;


      factory = MetadataFactory({
        legacyFactory: _LEGACY_FACTORY
      });

      sinon.stub(factory, 'formatResult', () => {});
      sinon.spy(factory.legacyFactory, 'getLegacyData');

      factory.getMetadata().then(() => {
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
