/* global describe, it */
'use strict';


var ASCE7_05Factory = require('../src/lib/asce7_05-factory.js'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _DUMMY_FACTORY;

_DUMMY_FACTORY = {
  metadataFactory: {
    getMetadata: () => { return Promise.resolve([]); }
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
  siteAmplificationFactory: {
    getSiteAmplificationData: () => { return Promise.resolve([]); }
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

    it('calls expected calculation methods', (done) => {
      var factory;

      factory = ASCE7_05Factory();

      sinon.spy(factory, 'computeUniformHazard');

      factory.computeBasicDesign({
        inputs: {
          latitude: 35,
          longitude: -118
        },
        metadata: {
          ssMaxDirection: 0,
          ssPercentile: 0,
          ssdFloor: 0,
          s1MaxDirection: 0,
          s1Percentile: 0,
          s1dFloor: 0,
        },
        probabilistic: [{
          request: {
            parameters: {
              latitude: 35,
              longitude: -118
            }
          },
          response: {
            data: {ss: 0, s1: 0, pga: 0}
          }
        }]
      }).then(() => {
        expect(factory.computeUniformHazard.callCount).to.equal(2);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeUniformHazard.restore();

        factory.destroy();

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

  describe('formatResult', () => {
    it('returns a promise', () => {
      var factory;

      factory = ASCE7_05Factory();

      expect(factory.formatResult()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('resolves with expected data structure', (done) => {
      var factory;

      factory = ASCE7_05Factory();

      factory.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga': null,
          'ssuh': null,
          'ssrt': null,
          'ssd': null,
          's1uh': null,
          's1rt': null,
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
          'pgadPercentileFactor': null,
          'pgadFloor': null,

          's1MaxDirFactor': null,
          's1dPercentileFactor': null,
          's1dFloor': null,

          'ssMaxDirFactor': null,
          'ssdPercentileFactor': null,
          'ssdFloor': null
        },
        'probabilistic': {},
        'riskCoefficients': {
          'response': {
            'data': {}
          }
        },
        'siteAmplification': {
          'fa': null,
          'fa_error': null,
          'fv': null,
          'fv_error': null
        },
        'designCategory': {
          'sdcs': null,
          'sdc1': null,
          'sdc': null
        },
        'spectra': {
          'smSpectrum': [],
          'sdSpectrum': []
        }
      }).then((formatted) => {
        [
          'ss', 's1',
          'sms', 'sm1',
          'sds', 'sd1',
          'fa', 'fa_error', 'fv', 'fv_error',
          'smSpectrum', 'sdSpectrum'
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });
        [
          'pgadPercentileFactor', 'pgadFloor',
          's1MaxDirFactor', 's1dPercentileFactor', 's1dFloor',
          'ssMaxDirFactor', 'ssdPercentileFactor', 'ssdFloor'
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

      sinon.spy(factory.metadataFactory, 'getMetadata');
      sinon.spy(factory.probabilisticService, 'getData');

      sinon.stub(factory, 'computeBasicDesign').callsFake(
          () => {return Promise.resolve({}); });

      sinon.spy(factory.siteAmplificationFactory, 'getSiteAmplificationData');
      sinon.stub(factory, 'computeFinalDesign').callsFake(
          () => { return Promise.resolve([]); });
      sinon.spy(factory.designCategoryFactory, 'getDesignCategory');
      sinon.stub(factory, 'computeSpectra').callsFake(
          () => { return Promise.resolve([]); });
      sinon.stub(factory, 'formatResult').callsFake(
          () => { return Promise.resolve([]); });
      sinon.stub(factory, 'makeMultipleRequests').callsFake(
          () => { return Promise.resolve([]); });

      factory.get({}).then((/*result*/) => {
        expect(factory.metadataFactory.getMetadata.callCount).to.equal(1);
        expect(factory.probabilisticService.getData.callCount).to.equal(1);

        expect(factory.computeBasicDesign.callCount).to.equal(1);

        expect(factory.siteAmplificationFactory
            .getSiteAmplificationData.callCount).to.equal(1);
        expect(factory.computeFinalDesign.callCount).to.equal(1);
        expect(factory.designCategoryFactory
            .getDesignCategory.callCount).to.equal(1);
        expect(factory.computeSpectra.callCount).to.equal(1);

        expect(factory.formatResult.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });
});
