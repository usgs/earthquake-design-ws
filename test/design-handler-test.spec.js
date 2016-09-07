/* global afterEach, beforeEach, describe, it */
'use strict';

var DesignHandler = require('../src/handler/design-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


var designFactory,
    input;

designFactory = {
  getDesignData: () => {
    return Promise.resolve(input);
  }
};

input = {
  'title': 'This is a title',
  'latitude': 30,
  'longitude': 80,
  'referenceDocument': 'Building code',
  'siteClass': 'site class B',
  'riskCategory': 3
};


describe('design-handler-test', () => {
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
      designHandler = DesignHandler({designFactory: designFactory});
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
      designHandler = DesignHandler({designFactory: designFactory});
    });

    it('calls checkParams method', () => {
      sinon.stub(designHandler, 'checkParams', () => {
        return Promise.resolve({});
      });
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
        expect(params).to.deep.equal(input);
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });
});
