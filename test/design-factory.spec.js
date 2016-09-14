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
  getRiskCoefficients: () => { return Promise.resolve({}); },
  getSiteAmplificationData: () => { return Promise.resolve({}); },
  getSpectrum: () => { return Promise.resolve({}); }
};

_EPSILON = Number.EPSILON;


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
      sinon.spy(factory, 'computeGroundMotion');

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
        expect(factory.computeGroundMotion.callCount).to.equal(3);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeUniformHazard.restore();
        factory.computeUniformRisk.restore();
        factory.computeDeterministic.restore();
        factory.computeGroundMotion.restore();

        factory.destroy();

        done(err);
      });
    });
  });

  describe('computeDesignValue', () => {
    it('returns expected values', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeDesignValue(1.0)).to.be.closeTo(2/3, _EPSILON);
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

    it('calls expected calculation methods', (done) => {
      var factory;

      factory = DesignFactory();

      sinon.spy(factory, 'computeSiteModifiedValue');
      sinon.spy(factory, 'computeDesignValue');

      factory.computeFinalDesign({
        basicDesign: {ss: 0, s1: 0, pga: 0},
        siteAmplification: {fa: 0, fv: 0, fpga: 0}
      }).then(() => {
        expect(factory.computeSiteModifiedValue.callCount).to.equal(3);
        expect(factory.computeDesignValue.callCount).to.equal(2);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeSiteModifiedValue.restore();
        factory.computeDesignValue.restore();

        factory.destroy();

        done(err);
      });
    });
  });

  describe('computeGroundMotion', () => {
    it('returns expected results', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeGroundMotion(0, 1)).to.equal(0);
      expect(factory.computeGroundMotion(1, 2)).to.equal(1);
      expect(factory.computeGroundMotion(2, 1)).to.equal(1);
      expect(factory.computeGroundMotion(1, 0)).to.equal(0);

      factory.destroy();
    });
  });

  describe('computeSiteModified', () => {
    it('returns expected results', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeSiteModifiedValue(0, 1)).to.equal(0);
      expect(factory.computeSiteModifiedValue(1, 2)).to.equal(2);
      expect(factory.computeSiteModifiedValue(2, 1)).to.equal(2);
      expect(factory.computeSiteModifiedValue(1, 0)).to.equal(0);

      factory.destroy();
    });
  });

  describe('computeSpectra', () => {
    it('returns a promise', () => {
      var factory;

      factory = DesignFactory({spectraFactory: _DUMMY_FACTORY});

      expect(factory.computeSpectra({})).to.be.instanceof(Promise);
    });

    it('calls factory method twice', (done) => {
      var factory;

      factory = DesignFactory({spectraFactory: _DUMMY_FACTORY});
      sinon.spy(factory.spectraFactory, 'getSpectrum');

      factory.computeSpectra().then((/*spectra*/) => {
        expect(factory.spectraFactory.getSpectrum.callCount).to.equal(2);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.spectraFactory.getSpectrum.restore();
        factory.destroy();
        factory = null;
        done(err);
      });
    });
  });

  describe('computeUniformHazard', () => {
    it('returns expected results', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeUniformHazard(0, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformHazard(1, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformHazard(0, 1)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformHazard(1, 1)).to.be.closeTo(1, _EPSILON);
      expect(factory.computeUniformHazard(2, 3)).to.be.closeTo(6, _EPSILON);

      factory.destroy();
    });
  });
  describe('computeUniformRisk', () => {
    it('returns expected results', () => {
      var factory;

      factory = DesignFactory();

      expect(factory.computeUniformRisk(0, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(1, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(0, 1)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(1, 1)).to.be.closeTo(1, _EPSILON);
      expect(factory.computeUniformRisk(2, 3)).to.be.closeTo(6, _EPSILON);

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

    it('resolves with expected data structure', (done) => {
      var factory;

      factory = DesignFactory();

      factory.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga': null,
          'ssuh': null,
          'ssur': null,
          'ssd': null,
          's1uh': null,
          's1ur': null,
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
          'ssMaxDirection': null,
          's1MaxDirection': null,
          'ssPercentile': null,
          's1Percentile': null,
          'pgaPercentile': null,
          'ssdFloor': null,
          's1dFloor': null,
          'pgadFloor': null
        },
        'probabilistic': {},
        'riskCoefficients': {},
        'siteAmplification': {}
      }).then((formatted) => {
        [
          'ss', 's1', 'pga',
          'ssuh', 's1uh',
          'ssur', 's1ur',
          'ssd', 's1d', 'pgad',
          'sms', 'sm1', 'pgam',
          'sds', 'sd1'
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });

        [
          's1MaxDirection', 'ssMaxDirection',
          'pgaPercentile', 's1Percentile', 'ssPercentile',
          'pgadFloor', 's1dFloor', 'ssdFloor'
        ].forEach((key) => {
          expect(formatted.metadata.hasOwnProperty(key)).to.equal(true);
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
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
        siteAmplificationFactory: _DUMMY_FACTORY,
        spectraFactory: _DUMMY_FACTORY
      });

      expect(factory.getDesignData()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected sub-methods', (done) => {
      var factory;

      factory = DesignFactory({
        metadataFactory: _DUMMY_FACTORY,
        probabilisticHazardFactory: _DUMMY_FACTORY,
        deterministicHazardFactory: _DUMMY_FACTORY,
        riskTargetingFactory: _DUMMY_FACTORY,
        siteAmplificationFactory: _DUMMY_FACTORY,
        spectraFactory: _DUMMY_FACTORY
      });

      sinon.spy(factory.metadataFactory, 'getMetadata');
      sinon.spy(factory.probabilisticHazardFactory, 'getProbabilisticData');
      sinon.spy(factory.deterministicHazardFactory, 'getDeterministicData');
      sinon.spy(factory.riskTargetingFactory, 'getRiskCoefficients');

      sinon.spy(factory, 'computeBasicDesign');

      sinon.spy(factory.siteAmplificationFactory, 'getSiteAmplificationData');
      sinon.spy(factory, 'computeFinalDesign');
      sinon.spy(factory, 'computeSpectra');

      sinon.spy(factory, 'formatResult');

      factory.getDesignData().then((/*result*/) => {
        expect(factory.metadataFactory.getMetadata.callCount).to.equal(1);
        expect(factory.probabilisticHazardFactory
            .getProbabilisticData.callCount).to.equal(1);
        expect(factory.deterministicHazardFactory
            .getDeterministicData.callCount).to.equal(1);
        expect(factory.riskTargetingFactory
            .getRiskCoefficients.callCount).to.equal(1);

        expect(factory.computeBasicDesign.callCount).to.equal(1);

        expect(factory.siteAmplificationFactory
            .getSiteAmplificationData.callCount).to.equal(1);
        expect(factory.computeFinalDesign.callCount).to.equal(1);
        expect(factory.computeSpectra.callCount).to.equal(1);

        expect(factory.formatResult.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.metadataFactory.getMetadata.restore();
        factory.probabilisticHazardFactory.getProbabilisticData.restore();
        factory.deterministicHazardFactory.getDeterministicData.restore();
        factory.riskTargetingFactory.getRiskCoefficients.restore();

        factory.computeBasicDesign.restore();

        factory.siteAmplificationFactory.getSiteAmplificationData.restore();
        factory.computeFinalDesign.restore();
        factory.computeSpectra.restore();

        factory.formatResult.restore();

        factory.destroy();
        done(err);
      });
    });
  });
});
