/* global afterEach, beforeEach, describe, it */
'use strict';

var DesignHandler = require('../src/lib/asce7_16-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


var _DESIGN_FACTORY,
    _INPUT;


_INPUT = {
  'title': 'This is a title',
  'latitude': 30,
  'longitude': 80,
  'siteClass': 'site class B',
  'riskCategory': 3
};

_DESIGN_FACTORY = {
  getDesignData: () => {
    return Promise.resolve(_INPUT);
  }
};


describe('asce7-16-handler-test', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var designHandler;

      designHandler = DesignHandler();

      expect(designHandler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    var designHandler;

    afterEach(() => {
      designHandler.destroy();
    });

    beforeEach(() => {
      designHandler = DesignHandler({factory: _DESIGN_FACTORY});
    });

    it('returns error if parameters are missing', (done) => {
      designHandler.checkParams({}).then(() => {
        return new Error('checkParams passed');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.status).to.equal(400);
      }).then(done);
    });
  });

  describe('get', () => {
    var designHandler;

    afterEach(() => {
      designHandler.destroy();
    });

    beforeEach(() => {
      designHandler = DesignHandler({factory: _DESIGN_FACTORY});
    });

    it('calls checkParams method', () => {
      sinon.stub(designHandler, 'checkParams', () => {
        return Promise.resolve({});
      });

      designHandler.get();

      expect(designHandler.checkParams.callCount).to.equal(1);

      designHandler.checkParams.restore();
    });

    it('returns a promise', () => {
      var result;

      result = designHandler.get({});

      expect(result).to.be.an.instanceof(Promise);
    });

    it('returns an object with data', (done) => {
      sinon.stub(designHandler, 'checkParams', () => {
        return Promise.resolve({});
      });

      designHandler.get({}).then((params) => {
        expect(params).to.deep.equal(_INPUT);
      }).catch((err) => {
        return err;
      }).then(done);

      designHandler.checkParams.restore();
    });
  });
});
