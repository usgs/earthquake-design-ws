/* global describe, it */
'use strict';


var DesignFactory = require('../src/lib/design-factory.js'),
    expect = require('chai').expect;


var _DUMMY_FACTORY;

_DUMMY_FACTORY = {
  getMetadata: () => { return Promise.resolve({}); },
  getProbabilisticData: () => { return Promise.resolve({}); },
  getDeterministicData: () => { return Promise.resolve({}); },
  getRiskCoefficients: () => { return Promise.resolve({}); }
};


describe('DesignFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = DesignFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });
  });

  describe('computeFinalDesign', () => {
    it('returns a promise', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeFinalDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });
  });

  describe('formatResult', () => {
    it('returns a promise', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.formatResult()).to.be.instanceof(Promise);

      factory.destroy();
    });
  });

  describe('getDesignData', () => {
    it('returns a promise', () => {
      var factory;

      factory = DesignFactory({
        metadataFactory: _DUMMY_FACTORY,
        probabilisticHazardFactory: _DUMMY_FACTORY,
        deterministicHazardFactory: _DUMMY_FACTORY,
        riskTargetingFactory: _DUMMY_FACTORY,
        siteAmplificationFactory: _DUMMY_FACTORY
      });

      expect(factory.getDesignData()).to.be.instanceof(Promise);

      factory.destroy();
    });
  });
});
