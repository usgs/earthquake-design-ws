/* global describe, it */
'use strict';


const expect = require('chai').expect,
    VerticalCoefficientFactory = require('../src/lib/vertical-coefficient-factory');


describe('VerticalCoefficientFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof VerticalCoefficientFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(VerticalCoefficientFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        let factory;

        factory = VerticalCoefficientFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getVerticalCoefficientData', () => {
    it('returns a promise', () => {
      let factory,
          result;

      factory = VerticalCoefficientFactory();
      result = factory.getVerticalCoefficientData();

      expect(result).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects if missing required paramter', (done) => {
      let badReference,
          noReference,
          noSiteClass,
          factory;

      factory = VerticalCoefficientFactory();

      noReference = factory.getVerticalCoefficientData({})
        .then(() => {
          return new Error('noReference failed');
        }).catch((err) => {
          expect(err.message).to.equal('"referenceDocument" must be ' +
              'provided to compute vertical coefficient value.');
        });

      noSiteClass = factory.getVerticalCoefficientData(
          {referenceDocument: 'referenceDocument'})
        .then(() => {
          return new Error('noSiteClass failed');
        }).catch((err) => {
          expect(err.message).to.equal('"siteClass" must be provided to ' +
              'compute vertical coefficient value.');
        });

      badReference = factory.getVerticalCoefficientData(
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
      let factory,
          lookupTable;

      lookupTable = {
        bins: [0, 1, 2, 3, 4, 5],
        restriction: {
          'siteClass': null
        },
        siteClasses: {
          'siteClass': [0, 1, 2, 3, 4, 5]
        }
      };

      factory = VerticalCoefficientFactory({
        lookupTables: {
          'referenceDocument': {
            'ss': lookupTable
          }
        }
      });

      factory.getVerticalCoefficientData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 0.5
      }).then((result) => {
        expect(result).to.be.instanceof(Object);
        expect(result.hasOwnProperty('cv')).to.equal(true);
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });

  });
});
