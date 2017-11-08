/* global describe, it */
'use strict';


const NSHM2008Factory = require('../../src/lib/basis/nshm_2008-factory'),
    expect = require('chai').expect,
    NumberUtils = require('../../src/lib/util/number-utils').instance,
    sinon = require('sinon');


const data = {
  'basicDesign': {
    'ss': 0,
    's1': 0,
    'pga': 0
  },
  'deterministic': [
    {
      'request': {
        'date': '2017-10-05T14:46:12.602Z',
        'referenceDocument': 'ASCE7-10',
        'status': 'success',
        'url': 'http://localhost/ws/designmaps/deterministic.json?latitude=34&longitude=-118&referenceDocument=ASCE7-10',
        'parameters': {
          'latitude': 34,
          'longitude': -118
        }
      },
      'response': {
        'data': {
          'pgad': 0.5666,
          's1d': 0.4291,
          'ssd': 1.3788
        },
        'metadata': {
          'spatialInterpolationMethod': 'linearlinearlinear',
          'regionName': 'E2008R2_COUS0P01_Deterministic',
          'gridSpacing': 0.01
        }
      }
    }
  ],
  'finalDesign': null,
  'metadata': {
    'model_veresion': 'v3.1.x',
    'pgadFloor': 0.5,
    'pgadPercentileFactor': 1.8,
    's1MaxDirFactor': 1.3,
    's1dFloor': 0.6,
    's1dPercentileFactor': 1.8,
    'spatialInterpolationMethod': 'linearlinearlinear',
    'ssMaxDirFactor': 1.1,
    'ssdFloor': 1.5,
    'ssdPercentileFactor': 1.8
  },
  'probabilistic': [
    {
      'request': {
        'date': '2017-10-05T14:46:12.600Z',
        'referenceDocument': 'ASCE7-10',
        'status': 'success',
        'url': 'http://localhost/ws/designmaps/probabilistic.json?latitude=34&longitude=-118&referenceDocument=ASCE7-10',
        'parameters': {
          'latitude': 34,
          'longitude': -118
        }
      },
      'response': {
        'data': {
          'pga': 0.89359,
          's1': 0.67503,
          'ss': 2.2676
        },
        'metadata': {
          'spatialInterpolationMethod': 'linearlinearlinear',
          'regionName': 'E2008R2_COUS0P01_Probabilistic',
          'gridSpacing': 0.01
        }
      }
    }
  ],
  'riskCoefficients': [
    {
      'request': {
        'date': '2017-10-05T14:46:12.603Z',
        'referenceDocument': 'ASCE7-10',
        'status': 'success',
        'url': 'http://localhost/ws/designmaps/risk-coefficient.json?latitude=34&longitude=-118&referenceDocument=ASCE7-10',
        'parameters': {
          'latitude': 34,
          'longitude': -118
        }
      },
      'response': {
        'data': {
          'cr1': 0.93991,
          'crs': 0.92512
        },
        'metadata': {
          'spatialInterpolationMethod': 'linearlinearlinear',
          'regionName': 'E2008R2_COUS0P01_Risk_Coefficient',
          'gridSpacing': 0.01
        }
      }
    }
  ],
  'siteAmplification': null,
  'tSubL': 8,
  'inputs': {
    'latitude': '34',
    'longitude': '-118',
    'riskCategory': 'III',
    'siteClass': 'C',
    'title': 'Example',
    'referenceDocument': 'ASCE7-10'
  }
};

const _DUMMY_FACTORY = {
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
  deterministicService: {
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
  riskCoefficientService: {
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
  designCategoryFactory: {
    getDesignCategory: () => { return Promise.resolve([]); }
  },
  spectraFactory: {
    getHorizontalSpectrum: () => { return Promise.resolve([]); }
  }
};

describe('asce7_10-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NSHM2008Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(NSHM2008Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = NSHM2008Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {
      let referenceDocument;

      referenceDocument = 'REFERENCE-TEST';

      const factory = NSHM2008Factory({
        referenceDocument: referenceDocument
      });
      expect(factory.referenceDocument).to.equal(referenceDocument);
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {
      let factory = NSHM2008Factory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects with an error when one occurs', function (done) {
      let factory;

      factory = NSHM2008Factory();

      factory.computeBasicDesign().then((/*obj*/) => {
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

    it('calls correct compute methods', (done) => {
      let factory;

      factory = NSHM2008Factory();

      sinon.spy(factory, 'computeUniformHazard');
      sinon.spy(factory, 'computeDeterministic');
      sinon.spy(factory, 'computeUniformRisk');
      sinon.spy(factory, 'computeGroundMotion');
      sinon.spy(NumberUtils, 'spatialInterpolate');

      factory.computeBasicDesign(data).then(() => {
        expect(factory.computeUniformHazard.callCount).to.equal(3);
        expect(factory.computeDeterministic.callCount).to.equal(3);
        expect(factory.computeUniformRisk.callCount).to.equal(2);
        expect(factory.computeGroundMotion.callCount).to.equal(3);
        expect(NumberUtils.spatialInterpolate.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.computeUniformHazard.restore();
        factory.computeDeterministic.restore();
        factory.computeUniformRisk.restore();
        factory.computeGroundMotion.restore();
        NumberUtils.spatialInterpolate.restore();

        factory.destroy();

        done(err);
      });
    });
  });

  describe('get', () => {
    it('returns a promise', () => {
      var factory;

      factory = NSHM2008Factory(_DUMMY_FACTORY);

      expect(factory.get()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('calls expected sub-methods', (done) => {
      var factory;

      factory = NSHM2008Factory(_DUMMY_FACTORY);

      sinon.spy(factory.deterministicService, 'getData');
      sinon.spy(factory.probabilisticService, 'getData');
      sinon.spy(factory.riskCoefficientService, 'getData');

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
      sinon.stub(factory.metadataFactory, 'getMetadata').callsFake(
          () => { return Promise.resolve([]); });

      factory.get({}).then((/*result*/) => {
        expect(factory.metadataFactory.getMetadata.callCount).to.equal(1);
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

  describe('makeMultipleRequests', () => {
    it('returns a promise', () => {
      var factory;

      factory = NSHM2008Factory(_DUMMY_FACTORY);

      expect(factory.makeMultipleRequests([], null, null)).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('makes multiple requests', () => {
      var factory,
          inputs,
          points,
          service;

      factory = NSHM2008Factory(_DUMMY_FACTORY);
      inputs = {
        referenceDocument: 'ASCE-TEST'
      };
      points = [
        {
          latitude: null,
          longitude: null,
        },
        {
          latitude: null,
          longitude: null,
        }
      ];
      service = {
        getData: () => { return; }
      };
      sinon.spy(service, 'getData');

      factory.makeMultipleRequests(points, inputs, service);

      expect(service.getData.callCount).to.equal(2);
      expect(service.getData.getCall(0).args[0]).to.deep.equal({
        latitude: points[0].latitude,
        longitude: points[0].longitude,
        referenceDocument: inputs.referenceDocument
      });
      expect(service.getData.getCall(1).args[0]).to.deep.equal({
        latitude: points[1].latitude,
        longitude: points[1].longitude,
        referenceDocument: inputs.referenceDocument
      });

      factory.destroy();
    });
  });
});
