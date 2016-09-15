/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    //sinon = require('sinon'),
    DesignCategoryFactory = require('../src/lib/design-category-factory');


describe('DesignCategoryFactory', () => {
  var factory;

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
        var factory;

        factory = DesignCategoryFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getDesignCategory', () => {
    it('throws an error when required values are omitted', (done) => {
      factory.getDesignCategory().then((/*result*/) => {
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
  });

  describe('mapDesignCategory', () => {
    it('returns the correct design category', () => {
      var f = factory;

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
