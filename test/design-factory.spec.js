/* global describe, it */
'use strict';


var DesignFactory = require('../src/lib/design-factory.js'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _DUMMY_FACTORY,
    _EPSILON;

_DUMMY_FACTORY = {
  getMetadata: () => { return Promise.resolve({}); },
  getProbabilisticData: () => { return Promise.resolve({}); },
  getDeterministicData: () => { return Promise.resolve({}); },
  getRiskCoefficients: () => { return Promise.resolve({}); }
};

_EPSILON = 1E-14;


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

    it('rejects with an error when one occurs', function (done) {
      var factory;

      factory = DesignFactory();

      factory.computeBasicDesign().then((/*obj*/) => {
        // This should not execute because we expect a rejected promise
        var err;

        err = new Error('[computeBasicDesign] resolved when it should reject');
        err.unitTestFailed = true;

        throw err;
      }).catch((err) => {
        if (err.unitTestFailed) {
          return err;
        }
      }).then((err) => {
        done(err);
      });
    });

    it('calls expected calculation methods', (done) => {
      var factory;

      factory = DesignFactory();

      sinon.spy(factory, 'computeUniformHazard');
      sinon.spy(factory, 'computeUniformRisk');
      sinon.spy(factory, 'computeDeterministic');
      sinon.spy(factory, 'computeDesignValue');

      factory.computeBasicDesign({
        metadata: {ssMaxDirection: 0, ssPercentile: 0, ssdFloor: 0,
            s1MaxDirection: 0, s1Percentile: 0, s1dFloor: 0,
            pgaPercentile: 0, pgadFloor: 0},
        probabilistic: {ss: 0, s1: 0, pga: 0},
        deterministic: {ss: 0, s1: 0, pga: 0},
        riskCoefficients: {crs: 0, cr1: 0}
      }).then(() => {
        expect(factory.computeUniformHazard.callCount).to.equal(2);
        expect(factory.computeUniformRisk.callCount).to.equal(2);
        expect(factory.computeDeterministic.callCount).to.equal(3);
        expect(factory.computeDesignValue.callCount).to.equal(3);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeUniformHazard.restore();
        factory.computeUniformRisk.restore();
        factory.computeDeterministic.restore();
        factory.computeDesignValue.restore();

        factory.destroy();

        done(err);
      });
    });
  });

  describe('computeDeterministic', () => {
    it('returns expected results', () => {
      var factory;

      factory = DesignFactory();

      // Use floor when it is greater
      expect(factory.computeDeterministic(
          0, 0, 0, 1.0)).to.be.closeTo(1.0, _EPSILON);
      expect(factory.computeDeterministic(
          2.0, 2.0, 2.0, 10.0)).to.be.closeTo(10.0, _EPSILON);
      // Use computed when it is greater
      expect(factory.computeDeterministic(
          2.0, 1.0, 1.0, 1.0)).to.be.closeTo(2.0, _EPSILON);
      expect(factory.computeDeterministic(
          3.0, 3.0, 3.0, 10.0)).to.be.closeTo(27.0, _EPSILON);

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
