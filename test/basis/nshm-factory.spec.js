/* global describe, it */
'use strict';


const NSHMFactory = require('../../src/lib/basis/nshm-factory.js'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _DUMMY_FACTORY = {
  metadataFactory: {
    getMetadata: () => { return Promise.resolve([]); }
  },
  probabilisticService: {
    getData: () => { return Promise.resolve({}); }
  },
  deterministicService: {
    getData: () => { return Promise.resolve({}); }
  },
  riskCoefficientService: {
    getData: () => { return Promise.resolve({}); }
  },
  tSubLService: {
    getData: () => { return Promise.resolve({response: {data: {}}}); }
  },
  siteAmplificationService: {
    getData: () => { return Promise.resolve({response: {data: {}}}); }
  },
  designCategoryFactory: {
    getDesignCategory: () => { return Promise.resolve([]); }
  },
  spectraFactory: {
    getHorizontalSpectrum: () => { return Promise.resolve([]); }
  }
};

const _EPSILON = Number.EPSILON;


describe('NSHMFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NSHMFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(NSHMFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {

        const factory = NSHMFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {

      const factory = NSHMFactory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects with an error when one occurs', function (done) {

      const factory = NSHMFactory();

      factory.computeBasicDesign().then((/*obj*/) => {
        // This should not execute because we expect a rejected promise
        let err;

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

      const factory = NSHMFactory();

      sinon.spy(factory, 'computeUniformHazard');
      sinon.spy(factory, 'computeUniformRisk');
      sinon.spy(factory, 'computeDeterministic');
      sinon.spy(factory, 'computeGroundMotion');

      factory.computeBasicDesign({
        metadata: {
          ssMaxDirection: 0,
          ssPercentile: 0,
          ssdFloor: 0,
          s1MaxDirection: 0,
          s1Percentile: 0,
          s1dFloor: 0,
          pgaPercentile: 0,
          pgadFloor: 0
        },
        probabilistic: {
          response: {
            data: {ss: 0, s1: 0, pga: 0}
          },
        },
        deterministic: {
          response: {
            data: {ss: 0, s1: 0, pga: 0},
          },
        },
        riskCoefficients: {
          response: {
            data: {crs: 0, cr1: 0}
          },
        },
      }).then(() => {
        expect(factory.computeUniformHazard.callCount).to.equal(3);
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

      const factory = NSHMFactory();

      expect(factory.computeDesignValue(1.0)).to.be.closeTo(2/3, _EPSILON);
      expect(factory.computeDesignValue(null)).to.equal(null);
    });
  });

  describe('computeDeterministic', () => {
    it('returns expected results', () => {

      const factory = NSHMFactory();

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

      const factory = NSHMFactory();

      expect(factory.computeFinalDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected calculation methods', (done) => {

      const factory = NSHMFactory();

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

      const factory = NSHMFactory();

      expect(factory.computeGroundMotion(0, 1)).to.equal(0);
      expect(factory.computeGroundMotion(1, 2)).to.equal(1);
      expect(factory.computeGroundMotion(2, 1)).to.equal(1);
      expect(factory.computeGroundMotion(1, 0)).to.equal(0);

      factory.destroy();
    });
  });

  describe('computeSiteModifiedValue', () => {
    it('returns expected results', () => {

      const factory = NSHMFactory();

      expect(factory.computeSiteModifiedValue(0, 1)).to.equal(0);
      expect(factory.computeSiteModifiedValue(1, 2)).to.equal(2);
      expect(factory.computeSiteModifiedValue(2, 1)).to.equal(2);
      expect(factory.computeSiteModifiedValue(1, 0)).to.equal(0);
      expect(factory.computeSiteModifiedValue(null, 0)).to.equal(null);
      expect(factory.computeSiteModifiedValue(0, null)).to.equal(null);
      expect(factory.computeSiteModifiedValue(null, null)).to.equal(null);

      factory.destroy();
    });
  });

  describe('computeSpectra', () => {
    it('returns a promise', () => {

      const factory = NSHMFactory(_DUMMY_FACTORY);

      expect(factory.computeSpectra({})).to.be.instanceof(Promise);
    });

    it('calls factory method twice', (done) => {

      let factory = NSHMFactory(_DUMMY_FACTORY);
      sinon.spy(factory.spectraFactory, 'getHorizontalSpectrum');

      factory.computeSpectra().then((/*spectra*/) => {
        expect(factory.spectraFactory.getHorizontalSpectrum.callCount).to.equal(2);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.spectraFactory.getHorizontalSpectrum.restore();
        factory.destroy();
        factory = null;
        done(err);
      });
    });
  });

  describe('computeUniformHazard', () => {
    it('returns expected results', () => {

      const factory = NSHMFactory();

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

      const factory = NSHMFactory();

      expect(factory.computeUniformRisk(0, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(1, 0)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(0, 1)).to.be.closeTo(0, _EPSILON);
      expect(factory.computeUniformRisk(1, 1)).to.be.closeTo(1, _EPSILON);
      expect(factory.computeUniformRisk(2, 3)).to.be.closeTo(6, _EPSILON);

      factory.destroy();
    });
  });

  describe('get', () => {
    it('returns a promise', () => {

      const factory = NSHMFactory(_DUMMY_FACTORY);

      expect(factory.get()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected sub-methods', (done) => {

      const factory = NSHMFactory(_DUMMY_FACTORY);

      sinon.spy(factory.metadataFactory, 'getMetadata');
      sinon.spy(factory.probabilisticService, 'getData');
      sinon.spy(factory.deterministicService, 'getData');
      sinon.spy(factory.riskCoefficientService, 'getData');

      sinon.stub(factory, 'computeBasicDesign').callsFake(
          () => {return Promise.resolve({}); });

      sinon.spy(factory.siteAmplificationService, 'getData');
      sinon.stub(factory, 'computeFinalDesign').callsFake(
          () => { return Promise.resolve([]); });
      sinon.spy(factory.designCategoryFactory, 'getDesignCategory');
      sinon.stub(factory, 'computeSpectra').callsFake(
          () => { return Promise.resolve([]); });

      factory.get({}).then((/*result*/) => {
        expect(factory.metadataFactory.getMetadata.callCount).to.equal(1);
        expect(factory.probabilisticService.getData.callCount).to.equal(1);
        expect(factory.deterministicService.getData.callCount).to.equal(1);
        expect(factory.riskCoefficientService.getData.callCount).to.equal(1);

        expect(factory.computeBasicDesign.callCount).to.equal(1);

        expect(factory.siteAmplificationService
            .getData.callCount).to.equal(1);
        expect(factory.computeFinalDesign.callCount).to.equal(1);
        expect(factory.designCategoryFactory
            .getDesignCategory.callCount).to.equal(1);
        expect(factory.computeSpectra.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });
});
