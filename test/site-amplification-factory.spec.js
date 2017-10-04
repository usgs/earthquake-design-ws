/* global after, before, describe, it */
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
        factory.destroy(); // double-destroy should be okay too
      }).to.not.throw(Error);
    });
  });

  describe('getSiteAmplificationData', () => {
    it('returns a promise', () => {
      let factory,
          result;

      factory = SiteAmplificationFactory();
      result = factory.getSiteAmplificationData({});

      expect(result).to.be.instanceof(Promise);

      // Just to supress uncaught rejection/exception
      result.catch(() => {});

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
  });


  describe('getSiteAmplificationData :: ' +
        'fa_note, fv_note are properly set', () => {
    let factory,
        lookupTable;

    after(() => {
      factory.destroy();
    });

    before(() => {
      lookupTable = {
        bins: [0.0, 1.0],
        restriction: {
          siteClass: {
            message: 'message',
            limit: 1.0
          }
        },
        siteClasses: {
          siteClass: [0.0, 1.0]
        }
      };

      factory = SiteAmplificationFactory({
        lookupTables: {
          referenceDocument: {
            ss: lookupTable,
            s1: lookupTable,
            pga: lookupTable
          }
        }
      });
    });

    it('sets both when both hit', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 1.5,
        s1: 1.5
      }).then((result) => {
        expect(result.hasOwnProperty('fa_note')).to.be.true;
        expect(result.hasOwnProperty('fv_note')).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('sets neither when neither hit', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 0.5,
        s1: 0.5
      }).then((result) => {
        expect(result.hasOwnProperty('fa_note')).to.be.false;
        expect(result.hasOwnProperty('fv_note')).to.be.false;
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('sets fa_note when just that hits', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 1.5,
        s1: 0.5
      }).then((result) => {
        expect(result.hasOwnProperty('fa_note')).to.be.true;
        expect(result.hasOwnProperty('fv_note')).to.be.false;
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('sets the fv_note when just that hits', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 0.5,
        s1: 1.5
      }).then((result) => {
        expect(result.hasOwnProperty('fa_note')).to.be.false;
        expect(result.hasOwnProperty('fv_note')).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('getSiteAmplificationData :: ' +
        'null-out fa/fv coefficient properly', () => {
    let factory,
        lookupTable;

    after(() => {
      factory.destroy();
    });

    before(() => {
      lookupTable = {
        bins: [0.0, 1.0],
        restriction: {
          siteClass: {
            message: 'message',
            limit: 1.0
          }
        },
        siteClasses: {
          siteClass: [0.0, 1.0]
        }
      };

      factory = SiteAmplificationFactory({
        lookupTables: {
          referenceDocument: {
            ss: lookupTable,
            s1: lookupTable
          },
          'ASCE7-16': {
            ss: lookupTable,
            s1: lookupTable
          }
        }
      });
    });

    it('nulls-out the values for ASCE7-16', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'ASCE7-16',
        siteClass: 'siteClass',
        ss: 1.5,
        s1: 1.5
      }).then((result) => {
        expect(result.fa).to.equal(null);
        expect(result.fv).to.equal(null);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('maintains proper values for non-ASCE7-16', (done) => {
      factory.getSiteAmplificationData({
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 1.5,
        s1: 1.5
      }).then((result) => {
        expect(result.fa).to.not.equal(null);
        expect(result.fv).to.not.equal(null);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });
});
