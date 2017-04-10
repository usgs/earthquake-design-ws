/* global afterEach, beforeEach, describe, it */
'use strict';

var RiskTargetingCoefficientHandler = require('../src/lib/risk-targeting-coefficient-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _FACTORY,
    _INPUT,
    _RESULT;


_INPUT = {
  gridSpacing: 0.5,
  latitude: 34.0,
  longitude: -118.0,
  region: 1
};

_FACTORY = {
  destroy: () => {
    // Nothing to do here
  },
  getRiskTargetingData: () => {
    return Promise.resolve(_RESULT);
  }
};

_RESULT = {
  'mapped_cr': 1,
  'mapped_crs': 2
};


describe('risk-targeting-coefficient-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof RiskTargetingCoefficientHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(RiskTargetingCoefficientHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = RiskTargetingCoefficientHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    var handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = RiskTargetingCoefficientHandler({factory: _FACTORY});
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

      handler = RiskTargetingCoefficientHandler({factory: _FACTORY});

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

      handler = RiskTargetingCoefficientHandler({factory: _FACTORY});

      stub = sinon.stub(handler, 'checkParams', () => {
        return Promise.resolve(_INPUT);
      });
      spy = sinon.spy(handler.factory, 'getRiskTargetingData');

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
