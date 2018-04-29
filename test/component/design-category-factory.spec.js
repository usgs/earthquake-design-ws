/* global afterEach, beforeEach, describe, it */
'use strict';


const expect = require('chai').expect,
    DesignCategoryFactory = require('../../src/lib/component/design-category-factory');


describe('DesignCategoryFactory', () => {
  let factory;

  beforeEach(() => {
    factory = DesignCategoryFactory();
  });

  afterEach(() => {
    factory = null;
  });

  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignCategoryFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignCategoryFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {

        const factory = DesignCategoryFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getDesignCategory', () => {
    it('throws an error when required values are omitted', (done) => {
      factory.getDesignCategory().then((/*result*/) => {
        let error;

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

    it('returns N when riskCategory equals "N"', (done) => {
      factory.getDesignCategory('N', 1, 1, 1).then((result) => {
        expect(result.sdc).to.equal('N');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns E when riskCategory equals "I or II or III" and s1 >= 0.75', (done) => {
      factory.getDesignCategory('I', 1, 1, 1).then((result) => {
        expect(result.sdc).to.equal('E');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns F when riskCategory equals "IV" and s1 >= 0.75', (done) => {
      factory.getDesignCategory('IV', 1, 1, 1).then((result) => {
        expect(result.sdc).to.equal('F');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns the greater design category', function (done) {
      factory.getDesignCategory('IV', 0, 0.3, 0.2).then((result) => {
        expect(result.sdc).to.equal('D');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns sdc = null when s1, sds, or sd1 are null', function (done) {
      factory.getDesignCategory('I', 0, null, null, null).then((result) => {
        expect(result.sdc).to.equal(null);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns sdc = null and sdc1 = null when sds and sd1 are null', function
        (done) {
      factory.getDesignCategory('I', 0, 1, null, null).then((result) => {
        expect(result.sdc).to.equal(null);
        expect(result.sdc1).to.equal(null);
        expect(result.sdcs).to.equal('D');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns sdc = null and sdcs = null when s1 and sd1 are null', function
        (done) {
      factory.getDesignCategory('I', 0, null, 1, null).then((result) => {
        expect(result.sdc).to.equal(null);
        expect(result.sdc1).to.equal('D');
        expect(result.sdcs).to.equal(null);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('mapDesignCategory', () => {
    it('returns the correct design category', () => {
      const f = factory;

      expect(f.mapDesignCategory('I', 'sds', null)).to.equal(null);

      expect(f.mapDesignCategory('I', 'sds', -1.0)).to.equal('A');
      expect(f.mapDesignCategory('I', 'sds', 0.1)).to.equal('A');
      expect(f.mapDesignCategory('I', 'sds', 0.2)).to.equal('B');
      expect(f.mapDesignCategory('I', 'sds', 0.4)).to.equal('C');
      expect(f.mapDesignCategory('I', 'sds', 0.6)).to.equal('D');

      expect(f.mapDesignCategory('IV', 'sds', 0.1)).to.equal('A');
      expect(f.mapDesignCategory('IV', 'sds', 0.2)).to.equal('C');
      expect(f.mapDesignCategory('IV', 'sds', 0.4)).to.equal('D');
      expect(f.mapDesignCategory('IV', 'sds', 0.6)).to.equal('D');

      expect(f.mapDesignCategory('I', 'sd1', 0.05)).to.equal('A');
      expect(f.mapDesignCategory('I', 'sd1', 0.10)).to.equal('B');
      expect(f.mapDesignCategory('I', 'sd1', 0.15)).to.equal('C');
      expect(f.mapDesignCategory('I', 'sd1', 0.25)).to.equal('D');

      expect(f.mapDesignCategory('IV', 'sd1', 0.05)).to.equal('A');
      expect(f.mapDesignCategory('IV', 'sd1', 0.10)).to.equal('C');
      expect(f.mapDesignCategory('IV', 'sd1', 0.15)).to.equal('D');
      expect(f.mapDesignCategory('IV', 'sd1', 0.25)).to.equal('D');
    });
  });
});
