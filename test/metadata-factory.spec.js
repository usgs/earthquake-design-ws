/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    MetadataFactory = require('../src/lib/metadata-factory'),
    NumberUtils = require('../src/lib/util/number-utils').instance,
    sinon = require('sinon');


describe.only('MetadataFactory', () => {
  var factory;

  beforeEach(() => {
    factory = MetadataFactory();
  });

  afterEach(() => {
    factory.destroy();
    factory = null;
  });

  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof MetadataFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(MetadataFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = MetadataFactory();
        factory.destroy();
        factory = null;
      }).to.not.throw(Error);
    });
  });

  describe('getMetadata', () => {
    it ('returns a promise', () => {
      expect(factory.getMetadata()).to.be.an.instanceof(Promise);
    });

    it('throws an error when params are not passed', (done) => {
      factory.getMetadata().then((/*result*/) => {
        var error;

        error = new Error('Method resolved but should have rejected!');
        error.assertionFailed = true; // Flag to distinguish this error

        throw error;
      }).catch((err) => {
        if (err.assertionFailed) {
          return err;
        }
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });

    it('calls each factory method', (done) => {
      var result;

      sinon.spy(factory, 'getData');
      sinon.spy(factory, 'getRegion');

      result = factory.getMetadata({
        latitude: 35,
        longitude: -105,
        referenceDocument: 'ASCE 41-13'
      });

      result.then(() => {
        expect(factory.getData.callCount).to.equal(1);
        expect(factory.getRegion.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getData.restore();
          factory.getRegion.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getRegion', () => {
    it ('returns a promise', () => {
      expect(factory.getRegion()).to.be.an.instanceof(Promise);
    });
    // returns correct data
    it('returns a region', (done) => {
      Promise.all([
        factory.getRegion(70, -170),
        factory.getRegion(35, -105),
        factory.getRegion(20, -160),
        factory.getRegion(18, -66)
      ]).then((results) => {
        expect(results[0]).to.equal('AK');
        expect(results[1]).to.equal('COUS');
        expect(results[2]).to.equal('HI');
        expect(results[3]).to.equal('PRVI');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe.skip('getData', () => {
    it ('returns a promise', () => {
      expect(factory.getData()).to.be.an.instanceof(Promise);
    });
    // returns correct region
    it('returns metadata', (done) => {
      var result;

      result = factory.getData('ASCE 41-13', 'COUS');
      result.then((results) => {
        expect(results.curve_interpolation_method).to.equal(
            NumberUtils.INTERPOLATE_USING_LOG);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });
});
