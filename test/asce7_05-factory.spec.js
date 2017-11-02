/* global describe, it */
'use strict';


var ASCE7_05Factory = require('../src/lib/asce7_05-factory.js'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _DUMMY_FACTORY;

_DUMMY_FACTORY = {
  metadataService: {
    getData: () => { return Promise.resolve({response: { data:[] } }); }
  },
  probabilisticService: {
    getData: () => {
      return Promise.resolve({
        response: {
          metadata: {
            gridSpacing: null
          }
        }
      });
    }
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


describe('ASCE7_05Factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_05Factory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE7_05Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = ASCE7_05Factory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {
      var factory;

      factory = ASCE7_05Factory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects with an error when one occurs', function (done) {
      var factory;

      factory = ASCE7_05Factory();

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
  });

  describe('computeFinalDesign', () => {
    it('returns a promise', () => {
      var factory;

      factory = ASCE7_05Factory();

      expect(factory.computeFinalDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected calculation methods', (done) => {
      var factory;

      factory = ASCE7_05Factory();

      sinon.spy(factory, 'computeSiteModifiedValue');
      sinon.spy(factory, 'computeDesignValue');

      factory.computeFinalDesign({
        basicDesign: {ss: 0, s1: 0, pga: 0},
        siteAmplification: {fa: 0, fv: 0, fpga: 0}
      }).then(() => {
        expect(factory.computeSiteModifiedValue.callCount).to.equal(2);
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

  describe('get', () => {
    it('returns a promise', () => {
      var factory;

      factory = ASCE7_05Factory(_DUMMY_FACTORY);

      expect(factory.get()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected sub-methods', (done) => {
      var factory;

      factory = ASCE7_05Factory(_DUMMY_FACTORY);

      sinon.spy(factory.metadataService, 'getData');
      sinon.spy(factory.probabilisticService, 'getData');

      sinon.stub(factory, 'computeBasicDesign').callsFake(
          () => {return Promise.resolve({}); });

      sinon.spy(factory.siteAmplificationService, 'getData');
      sinon.stub(factory, 'computeFinalDesign').callsFake(
          () => { return Promise.resolve([]); });
      sinon.spy(factory.designCategoryFactory, 'getDesignCategory');
      sinon.stub(factory, 'computeSpectra').callsFake(
          () => { return Promise.resolve([]); });
      sinon.stub(factory, 'makeMultipleRequests').callsFake(
          () => { return Promise.resolve([]); });

      factory.get({}).then((/*result*/) => {
        expect(factory.metadataService.getData.callCount).to.equal(1);
        expect(factory.probabilisticService.getData.callCount).to.equal(1);

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
