/* global afterEach, beforeEach, describe, it */
'use strict';

var DeterministicHandler = require('../src/lib/deterministic-handler'),
    expect = require('chai').expect,
    pg = require('pg'),
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
  'request': {
    'date': '2016-09-14T23:35:50.279Z',
    'referenceDocument': 'ASCE41-13',
    'status': 'success',
    'url': 'http://localhost:8000/ws/designmaps/deterministic.json?latitude=34&longitude=-118&referenceDocument=ASCE41-13',
    'parameters': {
      'latitude': 34,
      'longitude': -118
    }
  },
  'response': {
    'data': {
      'mapped_pgad': 0.5670918,
      'mapped_s1d': 0.53527123,
      'mapped_ssd': 1.35112175,
      'pgad': 1.02076524,
      's1d': 0.963488214,
      'ssd': 2.4320191500000004
    },
    'metadata': {
      'floor_pgad': 0.5,
      'floor_s1d': 0.6,
      'floor_ssd': 1.5,
      'percentile_pgad': 1.8,
      'percentile_s1d': 1.8,
      'percentile_ssd': 1.8
    }
  }
};


describe.only('deterministic-handler', () => {
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
    it('sets _this.db to a pg.Pool', () => {
      var handler;

      handler = DeterministicHandler({factory: _FACTORY});

      expect(handler.db).to.be.undefined;
      handler.createDbPool();

      expect(handler.db).to.be.instanceof(pg.Pool);

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
