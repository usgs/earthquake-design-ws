/* global describe, it */
'use strict';


const NEHRP2015Factory = require('../src/lib/nehrp-2015-factory'),
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

describe('nehrp-2015-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NEHRP2015Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(NEHRP2015Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = NEHRP2015Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = NEHRP2015Factory();
      expect(factory.referenceDocument).to.equal('NEHRP-2015');
    });
  });

  describe('get', () => {
    it('returns a promise and calls functions as intended', () => {

      const factory = NEHRP2015Factory(_DUMMY_FACTORY);

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
