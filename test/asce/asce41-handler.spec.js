/* global afterEach, beforeEach, describe, it */
'use strict';

const ASCE41Handler = require('../../src/lib/asce/asce41-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _RESULT = {
  data: [],
  metadata: {}
};

const _FACTORY = function () {
  return {
    destroy: () => {
      // Nothing to do here
    },
    get: () => {
      return Promise.resolve({data:[],metadata:{}});
    }
  };
};


describe('asce41-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      // if a factory is not passed in, then an error will be thrown
      expect(() => { ASCE41Handler({factory: _FACTORY}); }).to.not.throw(Error);
      expect(ASCE41Handler).to.throw(Error);
    });

    it('can be destroyed', () => {
      const handler = ASCE41Handler({factory: _FACTORY});
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = ASCE41Handler({factory: _FACTORY});
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

  describe('get', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = ASCE41Handler({factory: _FACTORY});
    });

    it('returns an object with data', (done) => {
      sinon.stub(handler, 'checkParams').callsFake(() => {
        return Promise.resolve({});
      });

      handler.get({}).then((params) => {
        expect(params).to.deep.equal(_RESULT);
      }).catch((err) => {
        return err;
      }).then(done);

      handler.checkParams.restore();
    });
  });
});
