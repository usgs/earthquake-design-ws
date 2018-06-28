/* global describe, it */
'use strict';


var AASHTO_2009Factory = require('../../src/lib/asce/aashto_2009-factory.js'),
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
  siteAmplificationService: {
    getData: () => { return Promise.resolve({response: {data: {}}}); }
  },
  spectraFactory: {
    getHorizontalSpectrum: () => { return Promise.resolve([]); }
  }
};


describe('AASHTO_2009Factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof AASHTO_2009Factory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(AASHTO_2009Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = AASHTO_2009Factory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {
      var factory;

      factory = AASHTO_2009Factory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects with an error when one occurs', function (done) {
      var factory;

      factory = AASHTO_2009Factory();

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

      factory = AASHTO_2009Factory();

      expect(factory.computeFinalDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected calculation methods', (done) => {
      var factory;

      factory = AASHTO_2009Factory();

      sinon.spy(factory, 'computeSiteModifiedValue');
      sinon.spy(factory, 'computeDesignValue');
      sinon.spy(factory, 'computeSpectralAcceleration');

      factory.computeFinalDesign({
        basicDesign: {ss: 0, s1: 0},
        siteAmplification: {fa: 0, fv: 0}
      }).then(() => {
        expect(factory.computeSiteModifiedValue.callCount).to.equal(2);
        expect(factory.computeSpectralAcceleration.callCount).to.equal(1);
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

  describe('calculateDesignCategory', () => {
    it('returns correct category', () => {
      var factory;

      factory = AASHTO_2009Factory();
      const siteClass = factory.calculateDesignCategory(0.09);
      expect(siteClass).to.not.be.null;
      expect(siteClass).to.equal('A');

      const siteClass2 = factory.calculateDesignCategory(0.0);
      expect(siteClass2).to.not.be.null;
      expect(siteClass2).to.equal('A');

      const siteClass3 = factory.calculateDesignCategory(-0.5);
      expect(siteClass3).to.not.be.null;
      expect(siteClass3).to.equal('A');

      const siteClass4 = factory.calculateDesignCategory(0.2);
      expect(siteClass4).to.not.be.null;
      expect(siteClass4).to.equal('B');

      const siteClass5 = factory.calculateDesignCategory(0.15);
      expect(siteClass5).to.not.be.null;
      expect(siteClass5).to.equal('B');

      const siteClass6 = factory.calculateDesignCategory(0.35);
      expect(siteClass6).to.not.be.null;
      expect(siteClass6).to.equal('C');

      const siteClass7 = factory.calculateDesignCategory(0.30);
      expect(siteClass7).to.not.be.null;
      expect(siteClass7).to.equal('C');

      const siteClass8 = factory.calculateDesignCategory(0.55);
      expect(siteClass8).to.not.be.null;
      expect(siteClass8).to.equal('D');

      const siteClass9 = factory.calculateDesignCategory(0.50);
      expect(siteClass9).to.not.be.null;
      expect(siteClass9).to.equal('D');

    });
  });

  describe('get', () => {
    it('returns a promise', () => {
      var factory;

      factory = AASHTO_2009Factory(_DUMMY_FACTORY);

      expect(factory.get()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected sub-methods', (done) => {
      var factory;

      factory = AASHTO_2009Factory(_DUMMY_FACTORY);

      sinon.spy(factory.metadataService, 'getData');
      sinon.spy(factory.probabilisticService, 'getData');

      sinon.stub(factory, 'computeBasicDesign').callsFake(
          () => {return Promise.resolve({}); });

      sinon.spy(factory.siteAmplificationService, 'getData'); 
      sinon.stub(factory, 'computeFinalDesign').callsFake(
          () => { return Promise.resolve([]); });
      sinon.stub(factory, 'calculateDesignCategory').callsFake(
          () => {return Promise.resolve({}); });
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
        expect(factory.calculateDesignCategory.callCount).to.equal(1);
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
