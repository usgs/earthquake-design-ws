/* global after, before, describe, it */
'use strict';


var expect = require('chai').expect,
    sinon = require('sinon'),
    SiteAmplificationFactory = require('../src/lib/site-amplification-factory');


var _EPSILON;

_EPSILON = 1E-10;

describe('SiteAmplificationFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof SiteAmplificationFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(SiteAmplificationFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = SiteAmplificationFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getAmplificationFactor', () => {
    var factory,
        xvals,
        yvals;

    before(() => {
      xvals = [0, 1, 2, 3, 4];
      yvals = [0, 1, 2, 3, 4];

      factory = SiteAmplificationFactory();
    });

    after(() => {
      factory.destroy();
    });


    it('returns first value when below bounds', () => {
      var result;

      result = factory.getAmplificationFactor(xvals,  yvals, -1);

      expect(result).to.equal(yvals[0]);
    });

    it('returns last value when above bounds', () => {
      var result;

      result = factory.getAmplificationFactor(xvals, yvals, 5);

      expect(result).to.equal(yvals[yvals.length - 1]);
    });

    it('calls interpolate for intermediate values', () => {
      var result;

      sinon.spy(factory, 'interpolate');

      result = factory.getAmplificationFactor(xvals, yvals, 2.5);

      expect(factory.interpolate.callCount).to.equal(1);
      expect(result).to.be.closeTo(2.5, _EPSILON);

      factory.interpolate.restore();
    });
  });

  describe('getSiteAmplificationData', () => {
    it('returns a promise', () => {
      var factory,
          result;

      factory = SiteAmplificationFactory();
      result = factory.getSiteAmplificationData();

      expect(result).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects if missing required paramter', (done) => {
      var badReference,
          noReference,
          noSiteClass,
          factory;

      factory = SiteAmplificationFactory();

      noReference = factory.getSiteAmplificationData({})
        .then(() => {
          return new Error('noReference failed');
        }).catch((err) => {
          expect(err.message).to.equal('"referenceDocument" must be ' +
              'provided to compute site amplification values.');
        });

      noSiteClass = factory.getSiteAmplificationData(
          {referenceDocument: 'referenceDocument'})
        .then(() => {
          return new Error('noSiteClass failed');
        }).catch((err) => {
          expect(err.message).to.equal('"siteClass" must be provided to ' +
              'compute site amplification values.');
        });

      badReference = factory.getSiteAmplificationData(
          {referenceDocument: 'referenceDocument', siteClass: 'siteClass'})
        .then(() => {
          return new Error('badReference failed');
        }).catch((err) => {
          expect(err.message).to.equal('Unknown reference document ' +
                '"referenceDocument"');
        });


      Promise.all([noReference, noSiteClass, badReference]).catch((err) => {
        return [err];
      }).then((results) => {
        factory.destroy();

        results.some((result) => {
          if (typeof result !== 'undefined') {
            done(result);
            return true; // stop loop
          }
        }) || done();
      });
    });

    it('resolves with a solution', (done) => {
      var factory,
          lookupTable;

      lookupTable = {
        bins: [0, 1, 2, 3, 4, 5],
        siteClasses: {
          'siteClass': [0, 1, 2, 3, 4, 5]
        }
      };

      factory = SiteAmplificationFactory({
        lookupTables: {
          'referenceDocument': {
            'ss': lookupTable,
            's1': lookupTable,
            'pga': lookupTable
          }
        }
      });

      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 0.5,
        s1: 2.25,
        pga: 5
      }).then((result) => {
        expect(result).to.be.instanceof(Object);
        expect(result.hasOwnProperty('fa')).to.equal(true);
        expect(result.hasOwnProperty('fv')).to.equal(true);
        expect(result.hasOwnProperty('fpga')).to.equal(true);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });

  describe('interpolate', function () {
    it('produces expected results', () => {
      var factory;

      factory = SiteAmplificationFactory();

      expect(factory.interpolate(0, 1, 0, 1, 0.5)).to.be.closeTo(0.5, _EPSILON);
      expect(factory.interpolate(0, 1, 1, 0, 0.5)).to.be.closeTo(0.5, _EPSILON);
      expect(factory.interpolate(0, 1, 0, 1, 0.0)).to.be.closeTo(0.0, _EPSILON);
      expect(factory.interpolate(0, 1, 0, 1, 1.0)).to.be.closeTo(1.0, _EPSILON);

      factory.destroy();
    });
  });
});
