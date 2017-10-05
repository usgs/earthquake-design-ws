/* global describe, it */
'use strict';


const ASCE7_10Factory = require('../src/lib/asce7_10-factory'),
    expect = require('chai').expect,
    NumberUtils = require('../src/lib/util/number-utils').instance,
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

describe('asce7_10-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_10Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(ASCE7_10Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = ASCE7_10Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = ASCE7_10Factory();
      expect(factory.referenceDocument).to.equal('ASCE7-10');
    });
  });

  describe('computeBasicDesign', () => {
    it('returns a promise', () => {
      let factory = ASCE7_10Factory();

      expect(factory.computeBasicDesign()).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects with an error when one occurs', function (done) {
      let factory;

      factory = ASCE7_10Factory();

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

      factory = ASCE7_10Factory();

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
});
