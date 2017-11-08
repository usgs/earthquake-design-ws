/* global describe, it */
'use strict';


const expect = require('chai').expect,
    SiteAmplificationFactory = require('../../src/lib/component/site-amplification-factory'),
    sinon = require('sinon');


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

  describe('getGroundMotionLevels', () => {
    it('returns a promise and queries the database', (done) => {
      let factory,
          result;

      factory = SiteAmplificationFactory({
        db: {
          query: () => {return Promise.resolve();}
        }
      });

      sinon.spy(factory.db, 'query');
      result = factory.getGroundMotionLevels('referenceDocument',
          'spectralPeriod');

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryGroundMotionLevels,
            ['referenceDocument', 'spectralPeriod'])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getSiteAmplificationFactors', () => {
    it('returns a promise and queries the database', (done) => {
      let factory,
          result;

      factory = SiteAmplificationFactory({
        db: {
          query: () => {return Promise.resolve();}
        }
      });

      sinon.spy(factory.db, 'query');
      result = factory.getSiteAmplificationFactors('referenceDocument',
          'spectralPeriod', 'siteClass');

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.querySiteAmplificationFactors,
            ['referenceDocument', 'spectralPeriod', 'siteClass'])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getRestrictions', () => {
    it('returns a promise and queries the database', (done) => {
      let factory,
          result;

      factory = SiteAmplificationFactory({
        db: {
          query: () => {return Promise.resolve();}
        }
      });

      sinon.spy(factory.db, 'query');
      result = factory.getRestrictions('referenceDocument',
          'spectralPeriod', 'siteClass');

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryRestrictions,
            ['referenceDocument', 'spectralPeriod', 'siteClass'])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('get', () => {
    it('returns a promise', () => {
      let factory,
          result;

      factory = SiteAmplificationFactory();

      sinon.stub(factory, 'getSiteAmplificationData').callsFake(() => {
        return Promise.resolve();
      });

      result = factory.get();

      expect(result).to.be.instanceof(Promise);
    });

    it('calls getSiteAmplificationData', (done) => {
      let factory,
          inputs;

      factory = SiteAmplificationFactory();

      sinon.stub(factory, 'getSiteAmplificationData').callsFake(() => {
        return Promise.resolve({
          factor: 'factor',
          note: 'note'
        });
      });

      inputs = 'inputs';
      factory.get(inputs).then((result) => {
        expect(factory.getSiteAmplificationData.callCount).to.equal(3);
        expect(factory.getSiteAmplificationData.getCall(0).args[0]).to.equal('ss');
        expect(factory.getSiteAmplificationData.getCall(0).args[1]).to.equal(inputs);
        expect(factory.getSiteAmplificationData.getCall(1).args[0]).to.equal('s1');
        expect(factory.getSiteAmplificationData.getCall(1).args[1]).to.equal(inputs);
        expect(factory.getSiteAmplificationData.getCall(2).args[0]).to.equal('pga');
        expect(factory.getSiteAmplificationData.getCall(2).args[1]).to.equal(inputs);
        expect(result).to.deep.equal({
          fa: 'factor',
          fa_note: 'note',
          fv: 'factor',
          fv_note:  'note',
          fpga: 'factor',
          fpga_note: 'note'
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
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
      let /*badReference,*/
          noReference,
          noSiteClass,
          factory;

      factory = SiteAmplificationFactory();

      noReference = factory.getSiteAmplificationData('s1', {
        s1: 5,
        siteClass: 'A'
      }).then(() => {
        return new Error('noReference failed');
      }).catch((err) => {
        expect(err.message).to.equal('"referenceDocument" must be provided ' +
        'to compute site amplification values.');
      });

      noSiteClass = factory.getSiteAmplificationData('s1', {
        s1: 5,
        referenceDocument: 'referenceDocument'
      }).then(() => {
        return new Error('noSiteClass failed');
      }).catch((err) => {
        expect(err.message).to.equal('"siteClass" must be provided to ' +
            'compute site amplification values.');
      });

      Promise.all([noReference, noSiteClass/*, badReference*/]).catch((err) => {
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

    it('resolves with a solution and calls correct methods', (done) => {
      let factory,
          groundMotionLevelBin,
          siteAmplificationFactors;

      groundMotionLevelBin = [0, 1, 2, 3, 4, 5];
      siteAmplificationFactors = [0, 1, 2, 3, 4, 5];

      factory = SiteAmplificationFactory();

      sinon.stub(factory, 'getGroundMotionLevels').callsFake(() => {
        return Promise.resolve({'rows':[{
          bin: groundMotionLevelBin
        }]});
      });

      sinon.stub(factory, 'getSiteAmplificationFactors').callsFake(() => {
        return Promise.resolve({'rows':[{
          factors: siteAmplificationFactors
        }]});
      });

      sinon.stub(factory, 'getRestrictions').callsFake(() => {
        return Promise.resolve({'rows':[{
          limit: 0,
          message: 'note'
        }]});
      });

      sinon.stub(factory.numberUtils, 'interpolateBinnedValue').callsFake(() =>
          {return 'factor';});


      factory.getSiteAmplificationData('ss', {
        referenceDocument: 'referenceDocument',
        siteClass: 'siteClass',
        ss: 0.5,
        s1: 2.25,
        pga: 5
      }).then((result) => {
        expect(result).to.be.instanceof(Object);
        expect(result).to.deep.equal({
          factor: 'factor',
          note: 'note'
        });
        expect(factory.getGroundMotionLevels.callCount).to.equal(1);
        expect(factory.getGroundMotionLevels.calledWith(
            'referenceDocument',
            'ss'
        ));
        expect(factory.getSiteAmplificationFactors.callCount).to.equal(1);
        expect(factory.getSiteAmplificationFactors.calledWith(
            'referenceDocument',
            'ss',
            'siteClass'
        ));
        expect(factory.getRestrictions.callCount).to.equal(1);
        expect(factory.getRestrictions.calledWith(
            'referenceDocument',
            'ss',
            'siteClass'
        ));
        expect(factory.numberUtils.interpolateBinnedValue.callCount).to.equal(1);
        expect(factory.numberUtils.interpolateBinnedValue.calledWith(
            groundMotionLevelBin,
            siteAmplificationFactors,
            0.5
        ));
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.getGroundMotionLevels.restore();
        factory.getSiteAmplificationFactors.restore();
        factory.getRestrictions.restore();
        factory.numberUtils.interpolateBinnedValue.restore();
        factory.destroy();
        done(err);
      });
    });

    it('sets factor to null for ASCE7-16', (done) => {
      let factory,
          groundMotionLevelBin,
          siteAmplificationFactors;

      groundMotionLevelBin = [0, 1, 2, 3, 4, 5];
      siteAmplificationFactors = [0, 1, 2, 3, 4, 5];

      factory = SiteAmplificationFactory();

      sinon.stub(factory, 'getGroundMotionLevels').callsFake(() => {
        return Promise.resolve({'rows':[{
          bin: groundMotionLevelBin
        }]});
      });

      sinon.stub(factory, 'getSiteAmplificationFactors').callsFake(() => {
        return Promise.resolve({'rows':[{
          factors: siteAmplificationFactors
        }]});
      });

      sinon.stub(factory, 'getRestrictions').callsFake(() => {
        return Promise.resolve({'rows':[{
          limit: 0,
          message: 'note'
        }]});
      });

      sinon.stub(factory.numberUtils, 'interpolateBinnedValue').callsFake(() =>
          {return 'factor';});

      factory.getSiteAmplificationData('ss', {
        referenceDocument: 'ASCE7-16',
        siteClass: 'siteClass',
        ss: 0.5,
        s1: 2.25,
        pga: 5
      }).then((result) => {
        expect(result).to.deep.equal({
          factor: null,
          note: 'note'
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.getGroundMotionLevels.restore();
        factory.getSiteAmplificationFactors.restore();
        factory.getRestrictions.restore();
        factory.numberUtils.interpolateBinnedValue.restore();
        factory.destroy();
        done(err);
      });
    });
  });
});
