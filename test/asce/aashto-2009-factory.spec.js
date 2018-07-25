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

      sinon.spy(factory, 'computeSpectralAcceleration');

      factory.computeFinalDesign({
        basicDesign: {ss: 0, s1: 0},
        siteAmplification: {fa: 0, fv: 0}
      }).then((finalDesign) => {
        expect(factory.computeSpectralAcceleration.callCount).to.equal(1);
        expect(finalDesign.hasOwnProperty('as')).to.be.true;
        expect(finalDesign.hasOwnProperty('sds')).to.be.true;
        expect(finalDesign.hasOwnProperty('sd1')).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeSpectralAcceleration.restore();

        factory.destroy();

        done(err);
      });
    });
  });

  describe('calculateDesignCategory', () => {
    it('returns correct category', (done) => {
      var factory;

      factory = AASHTO_2009Factory();
      Promise.all([
        factory.calculateDesignCategory(0.09),
        factory.calculateDesignCategory(0.0),
        factory.calculateDesignCategory(-0.5),
        factory.calculateDesignCategory(0.2),
        factory.calculateDesignCategory(0.15),
        factory.calculateDesignCategory(0.35),
        factory.calculateDesignCategory(0.30),
        factory.calculateDesignCategory(0.55),
        factory.calculateDesignCategory(0.50)
      ]).then((results) => {
        const verify = (result, expectation) => {
          expect(result).to.not.be.null;
          expect(result).to.equal(expectation);
        };

        verify(results[0], 'A');
        verify(results[1], 'A');
        verify(results[2], 'A');
        verify(results[3], 'B');
        verify(results[4], 'B');
        verify(results[5], 'C');
        verify(results[6], 'C');
        verify(results[7], 'D');
        verify(results[8], 'D');
      }).then(done);
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
