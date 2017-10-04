/* global describe, it */
'use strict';


const expect = require('chai').expect,
    SiteAmplificationFactory = require('../src/lib/site-amplification-factory');


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
        let factory;

        factory = SiteAmplificationFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getSiteAmplificationData', () => {
    it('returns a promise', () => {
      let factory,
          result;

      factory = SiteAmplificationFactory();
      result = factory.getSiteAmplificationData();

      expect(result).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('rejects if missing required paramter', (done) => {
      let badReference,
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

    it('resolves with an error and sets Fa, Fv values to null', (done) => {
      let factory,
          lookupTable;

      lookupTable =  {
        bins: [0.25, 0.50, 0.75, 1.00, 1.25, 1.50],
        restriction: {
          'A': null,
          'B': null,
          'B-estimated': null,
          'C': null,
          'D': null,
          'D-default': null,
          'E': {
            'message': 'See Section 11.4.7',
            'limit': 1.00
          }
        },
        siteClasses: {
          'A': [0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          'B': [0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
          'B-estimated': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          'C': [1.3, 1.3, 1.2, 1.2, 1.2, 1.2],
          'D': [1.6, 1.4, 1.2, 1.1, 1.0, 1.0],
          'D-default': [1.6, 1.4, 1.2, 1.2, 1.2, 1.2],
          'E': [2.4, 1.7, 1.3, 1.3, 1.3, 1.3]
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
        siteClass: 'E',
        ss: 1.25,
        s1: 1.50
      }).then((result) => {
        expect(result).to.be.instanceof(Object);
        expect(result.fa).to.equal(1.3);
        expect(result.fv).to.equal(1.3);
        expect(result.fa_note).to.equal('See Section 11.4.7');
        expect(result.fv_note).to.equal('See Section 11.4.7');
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        done(err);
      });
    });
  });
});
