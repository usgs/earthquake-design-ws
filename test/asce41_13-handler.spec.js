/* global afterEach, beforeEach, describe, it */
'use strict';

var ASCE41_13Handler = require('../src/lib/asce41_13-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _RESULT = {
  data: [],
  't-sub-l': {},
  metadata: {}
};

const _FACTORY = {
  destroy: () => {
    // Nothing to do here
  },
  get: () => {
    return Promise.resolve(_RESULT);
  }
};


describe('asce41_13-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_13Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_13Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = ASCE41_13Handler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    var handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = ASCE41_13Handler({factory: _FACTORY});
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
    var handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = ASCE41_13Handler({factory: _FACTORY});
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
