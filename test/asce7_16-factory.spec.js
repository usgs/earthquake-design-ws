/* global describe, it */
'use strict';


const ASCE7_16Factory = require('../src/lib/asce7_16-factory'),
    expect = require('chai').expect;
    //sinon = require('sinon');

const _DUMMY_FACTORY = {
  metadataFactory: {
    getMetadata: () => { return Promise.resolve([]); }
  },
  probabilisticService: {
    getData: () => { return Promise.resolve({}); }
  },
  deterministicService: {
    getData: () => { return Promise.resolve({}); }
  },
  riskCoefficientService: {
    getData: () => { return Promise.resolve({}); }
  },
  tSubLService: {
    getData: () => { return Promise.resolve({response: {data: {}}}); }
  },
  siteAmplificationFactory: {
    getSiteAmplificationData: () => { return Promise.resolve([]); }
  },
  designCategoryFactory: {
    getDesignCategory: () => { return Promise.resolve([]); }
  },
  spectraFactory: {
    getSpectrum: () => { return Promise.resolve([]); }
  }
};

describe('asce7_16-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_16Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(ASCE7_16Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = ASCE7_16Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = ASCE7_16Factory();
      expect(factory.referenceDocument).to.equal('ASCE7-16');
    });
  });

  describe('get', () => {
    it('returns a promise and calls functions as intended', () => {

      const factory = ASCE7_16Factory(_DUMMY_FACTORY);

      let result = factory.get({
        latitude: 0,
        longitude: 1,
        riskCategory: 2,
        siteClass: 'C',
        title: 'Test'
      });

      expect(result).to.be.instanceof(Promise);
    });
  });
});
