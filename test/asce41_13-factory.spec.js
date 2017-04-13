/* global after, before, describe, it */
'use strict';


var ASCE41_13Factory = require('../src/lib/asce41_13-factory'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _DUMMY_FACTORY;

_DUMMY_FACTORY = {
  getProbabilisticData: () => { return Promise.resolve({ss: 1, s1: 2}); },
  getSiteAmplificationData: () => { return Promise.resolve({fa: 3, fv: 4}); },
  getSpectrum: () => { return Promise.resolve([[5, 6], [7, 8]]); }
};


describe('asce41_13-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_13Factory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_13Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var factory;

      factory = ASCE41_13Factory();

      expect(factory.destroy).to.not.throw(Error);
    });
  });

  describe('get', () => {
    it('delegates to proper method', (done) => {
      var factory;

      factory = ASCE41_13Factory();
      sinon.stub(factory, 'getCustomProbabilityDesignData',
          () => { Promise.resolve({}); });
      sinon.stub(factory, 'getStandardDesignData',
          () => { Promise.resolve({}); });

      Promise.all([
        factory.get({customProbability: 0.1}),
        factory.get({})
      ]).then(() => {
        expect(factory.getCustomProbabilityDesignData.callCount).to.equal(1);
        expect(factory.getStandardDesignData.callCount).to.equal(1);

        factory.getCustomProbabilityDesignData.restore();
        factory.getStandardDesignData.restore();
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('getCustomProbabilityDesignData', () => {
    var factory;

    after(() => {
      factory.destroy();
    });

    before(() => {
      factory = ASCE41_13Factory({
        probabilisticHazardFactory: _DUMMY_FACTORY,
        siteAmplificationFactory: _DUMMY_FACTORY,
        spectraFactory: _DUMMY_FACTORY
      });
    });


    it('returns a promise', () => {
      expect(factory.getCustomProbabilityDesignData())
          .to.be.an.instanceof(Promise);
    });

    it('calls each factory method', (done) => {
      sinon.spy(factory.probabilisticHazardFactory, 'getProbabilisticData');
      sinon.spy(factory.siteAmplificationFactory, 'getSiteAmplificationData');
      sinon.spy(factory.spectraFactory, 'getSpectrum');

      factory.getCustomProbabilityDesignData().then(() => {
        expect(factory.probabilisticHazardFactory
            .getProbabilisticData.callCount).to.equal(1);
        expect(factory.siteAmplificationFactory
            .getSiteAmplificationData.callCount).to.equal(1);
        expect(factory.spectraFactory.getSpectrum.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.probabilisticHazardFactory.getProbabilisticData.restore();
        factory.siteAmplificationFactory.getSiteAmplificationData.restore();
        factory.spectraFactory.getSpectrum.restore();
        done(err);
      });
    });

    it('resolves with an expected object', (done) => {
      factory.getCustomProbabilityDesignData({customProbability: 0.0})
      .then((result) => {
        expect(result).to.deep.equal({
          hazardLevel: 'Custom',
          customProbability: 0.0,
          ss: 1, fa: 3, sxs: 3,
          s1: 2, fv: 4, sx1: 8,
          horizontalSpectrum: [[5, 6], [7, 8]]
        });
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });
});
