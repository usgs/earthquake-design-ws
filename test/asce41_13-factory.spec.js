/* global describe, it */
'use strict';


var ASCE41_13Factory = require('../src/lib/asce41_13-factory'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce41_13-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_13Factory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_13Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var factory;

      factory = ASCE41_13Factory();

      expect(factory.destroy).to.not.throw(Error);
    });
  });

  describe('get', () => {
    it('delegates to proper method', (done) => {
      var factory;

      factory = ASCE41_13Factory();
      sinon.stub(factory, 'getCustomProbabilityDesignData',
          () => { Promise.resolve({}); });
      sinon.stub(factory, 'getStandardDesignData',
          () => { Promise.resolve({}); });

      Promise.all([
        factory.get({customProbability: 0.1}),
        factory.get({})
      ]).then(() => {
        expect(factory.getCustomProbabilityDesignData.callCount).to.equal(1);
        expect(factory.getStandardDesignData.callCount).to.equal(1);

        factory.getCustomProbabilityDesignData.restore();
        factory.getStandardDesignData.restore();
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('getCustomProbabilityDesignData', () => {
    it.skip('needs tests', () => {
      // TODO :: Write some tests
    });
  });
});
