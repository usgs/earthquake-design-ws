/* global afterEach, beforeEach, describe, it */
'use strict';

var DeterministicHandler = require('../src/lib/deterministic-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _FACTORY,
    _INPUT,
    _RESULT;


_INPUT = {
  latitude: 34.0,
  longitude: -118.0,
  referenceDocument: 'ASCE41-13'
};

_FACTORY = {
  destroy: () => {
    // Nothing to do here
  },
  getDeterministicData: () => {
    return Promise.resolve(_RESULT);
  }
};

_RESULT = {
  'data': {
    'id': 9859572,
    'region_id': 4,
    'latitude': 35,
    'longitude': -90,
    'mapped_pgad': 0.2167,
    'mapped_s1d': 0.1343,
    'mapped_ssd': 0.4474,
    'pgad': 0.5,
    's1d': 0.6,
    'ssd': 1.5
  },
  'metadata': {
    'region': {
      'id': 4,
      'grid_spacing': 0.01,
      'max_latitude': 50,
      'max_longitude': -65,
      'min_latitude': 24.6,
      'min_longitude': -125,
      'name': 'E2008R2_COUS0P01_Deterministic'
    },
    'document': {
      'id': 3,
      'region_id': 4,
      'floor_pgad': 0.5,
      'floor_s1d': 0.6,
      'floor_ssd': 1.5,
      'interpolation_method': 'linear',
      'max_direction_pgad': 1,
      'max_direction_s1d': 1.3,
      'max_direction_ssd': 1.1,
      'model_version': 'v3.1.x',
      'percentile_pgad': 1.8,
      'percentile_s1d': 1.8,
      'percentile_ssd': 1.8,
      'name': 'ASCE41-13'
    }
  }
};


describe('deterministic-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DeterministicHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DeterministicHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = DeterministicHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    var handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = DeterministicHandler({factory: _FACTORY});
    });

    it('returns error if parameters are missing', (done) => {
      handler.checkParams({}).then(() => {
        return new Error('checkParams passed erroneously');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.status).to.equal(400);
      }).then(done);
    });
  });

  describe('createDbPool', () => {
    it('sets _this.db to a Pool', () => {
      var handler;

      handler = DeterministicHandler({factory: _FACTORY});

      expect(handler.db).to.be.undefined;
      handler.createDbPool();

      // Do a duck-type check on the db
      expect(typeof handler.db.destroy).to.equal('function');
      expect(typeof handler.db.query).to.equal('function');

      handler.destroy();
      handler = null;
    });
  });

  describe('get', () => {

    it('checks params and defers to factory', (done) => {
      var handler,
          spy,
          stub;

      handler = DeterministicHandler({factory: _FACTORY});

      stub = sinon.stub(handler, 'checkParams', () => {
        return Promise.resolve(_INPUT);
      });
      spy = sinon.spy(handler.factory, 'getDeterministicData');

      handler.get(_INPUT).then(() => {
        expect(stub.callCount).to.equal(1);
        expect(spy.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        stub.restore();
        spy.restore();
        handler.destroy();
        handler = null;
        done(err);
      });

      handler.checkParams.restore();
    });
  });
});
