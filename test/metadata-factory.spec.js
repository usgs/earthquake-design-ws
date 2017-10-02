/* global afterEach, beforeEach, describe, it */
'use strict';


const expect = require('chai').expect,
    MetadataFactory = require('../src/lib/metadata-factory'),
    NumberUtils = require('../src/lib/util/number-utils').instance,
    sinon = require('sinon');


describe('MetadataFactory', () => {
  let factory;

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
        let factory;

        factory = MetadataFactory();
        factory.destroy();
        factory = null;
      }).to.not.throw(Error);
    });
  });

  describe('_computeRegionArea', () => {
    let region;

    region = {
      'max_latitude':    45.0,
      'max_longitude': 112.0,
      'min_latitude':    40.0,
      'min_longitude': 110.0,
    };

    it ('returns correct area', () => {
      expect(factory._computeRegionArea(region)).to.equal(10);
    });
  });

  describe('getMetadata', () => {
    it ('returns a promise', () => {
      expect(factory.getMetadata()).to.be.an.instanceof(Promise);
    });

    it('throws an error when params are not passed', (done) => {
      factory.getMetadata().then((/*result*/) => {
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

    it('calls each factory method', (done) => {
      let result;

      sinon.spy(factory, 'getData');
      sinon.spy(factory, 'getRegion');

      result = factory.getMetadata({
        latitude: 35,
        longitude: -105,
        referenceDocument: 'ASCE41-13'
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

  describe('getData', () => {
    it ('returns a promise', () => {
      expect(factory.getData()).to.be.an.instanceof(Promise);
    });

    it('returns ASCE7-05 metadata', (done) => {
      Promise.all([
        factory.getData('ASCE7-05', 'PRVI0P05'),
        factory.getData('ASCE7-05', 'HI0P02')
      ]).then((results) => {
        let hi,
            prvi;

        prvi = results[0];
        hi = results[1];

        expect(prvi.modelVersion).to.equal('v2.0.x');
        expect(hi.modelVersion).to.equal('v2.0.x');

      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns ASCE7-10 metadata', (done) => {
      Promise.all([
        factory.getData('ASCE7-10', 'COUS0P01'),
        factory.getData('ASCE7-10', 'HI0P02')
      ]).then((results) => {
        let cous,
            hi;

        cous = results[0];
        hi = results[1];

        expect(cous.pgadPercentileFactor).to.equal(1.8);
        expect(cous.pgadFloor).to.equal(0.5);
        expect(cous.s1MaxDirFactor).to.equal(1.3);
        expect(cous.s1dPercentileFactor).to.equal(1.8);
        expect(cous.s1dFloor).to.equal(0.6);
        expect(cous.ssMaxDirFactor).to.equal(1.1);
        expect(cous.ssdPercentileFactor).to.equal(1.8);
        expect(cous.ssdFloor).to.equal(1.5);

        expect(hi.pgadPercentileFactor).to.equal(1.8);
        expect(hi.pgadFloor).to.equal(0.5);
        expect(hi.s1MaxDirFactor).to.equal(1.0);
        expect(hi.s1dPercentileFactor).to.equal(1.8);
        expect(hi.s1dFloor).to.equal(0.6);
        expect(hi.ssMaxDirFactor).to.equal(1.0);
        expect(hi.ssdPercentileFactor).to.equal(1.8);
        expect(hi.ssdFloor).to.equal(1.5);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    // returns correct region
    it('returns ASCE41-13 metadata', (done) => {
      factory.getData('ASCE41-13', 'COUS0P01').then((results) => {
        expect(results.curveInterpolationMethod).to.equal(
            NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns ASCE7-16 metadata', (done) => {
      factory.getData('ASCE7-16', 'COUS0P01').then((results) => {
        expect(results.pgadPercentileFactor).to.equal(1.8);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns IBC-2012 metadata', (done) => {
      Promise.all([
        factory.getData('IBC-2012', 'COUS0P01'),
        factory.getData('IBC-2012', 'HI0P02')
      ]).then((results) => {
        let cous,
            hi;

        cous = results[0];
        hi = results[1];

        expect(cous.pgadPercentileFactor).to.equal(1.8);
        expect(cous.pgadFloor).to.equal(0.6);
        expect(cous.s1MaxDirFactor).to.equal(1.3);
        expect(cous.s1dPercentileFactor).to.equal(1.8);
        expect(cous.s1dFloor).to.equal(0.6);
        expect(cous.ssMaxDirFactor).to.equal(1.1);
        expect(cous.ssdPercentileFactor).to.equal(1.8);
        expect(cous.ssdFloor).to.equal(1.5);

        expect(hi.pgadPercentileFactor).to.equal(1.8);
        expect(hi.pgadFloor).to.equal(0.6);
        expect(hi.s1MaxDirFactor).to.equal(1.0);
        expect(hi.s1dPercentileFactor).to.equal(1.8);
        expect(hi.s1dFloor).to.equal(0.6);
        expect(hi.ssMaxDirFactor).to.equal(1.0);
        expect(hi.ssdPercentileFactor).to.equal(1.8);
        expect(hi.ssdFloor).to.equal(1.5);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns IBC-2015 metadata', (done) => {
      Promise.all([
        factory.getData('IBC-2015', 'COUS0P01'),
        factory.getData('IBC-2015', 'HI0P02'),
        factory.getData('IBC-2015', 'AMSAM0P10')
      ]).then((results) => {
        let amsam,
            cous,
            hi;

        cous = results[0];
        hi = results[1];
        amsam = results[2];

        expect(cous.pgadPercentileFactor).to.equal(1.8);
        expect(cous.pgadFloor).to.equal(0.6);
        expect(cous.s1MaxDirFactor).to.equal(1.3);
        expect(cous.s1dPercentileFactor).to.equal(1.8);
        expect(cous.s1dFloor).to.equal(0.6);
        expect(cous.ssMaxDirFactor).to.equal(1.1);
        expect(cous.ssdPercentileFactor).to.equal(1.8);
        expect(cous.ssdFloor).to.equal(1.5);

        expect(hi.pgadPercentileFactor).to.equal(1.8);
        expect(hi.pgadFloor).to.equal(0.6);
        expect(hi.s1MaxDirFactor).to.equal(1.0);
        expect(hi.s1dPercentileFactor).to.equal(1.8);
        expect(hi.s1dFloor).to.equal(0.6);
        expect(hi.ssMaxDirFactor).to.equal(1.0);
        expect(hi.ssdPercentileFactor).to.equal(1.8);
        expect(hi.ssdFloor).to.equal(1.5);

        expect(amsam.pgadPercentileFactor).to.equal(1.8);
        expect(amsam.pgadFloor).to.equal(0.6);
        expect(amsam.s1MaxDirFactor).to.equal(1.3);
        expect(amsam.s1dPercentileFactor).to.equal(1.8);
        expect(amsam.s1dFloor).to.equal(0.6);
        expect(amsam.ssMaxDirFactor).to.equal(1.1);
        expect(amsam.ssdPercentileFactor).to.equal(1.8);
        expect(amsam.ssdFloor).to.equal(1.5);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns NEHRP-2009 metadata', (done) => {
      Promise.all([
        factory.getData('NEHRP-2009', 'COUS0P01'),
        factory.getData('NEHRP-2009', 'HI0P02')
      ]).then((results) => {
        let cous,
            hi;

        cous = results[0];
        hi = results[1];

        expect(cous.pgadPercentileFactor).to.equal(1.8);
        expect(cous.pgadFloor).to.equal(0.6);
        expect(cous.s1MaxDirFactor).to.equal(1.3);
        expect(cous.s1dPercentileFactor).to.equal(1.8);
        expect(cous.s1dFloor).to.equal(0.6);
        expect(cous.ssMaxDirFactor).to.equal(1.1);
        expect(cous.ssdPercentileFactor).to.equal(1.8);
        expect(cous.ssdFloor).to.equal(1.5);

        expect(hi.pgadPercentileFactor).to.equal(1.8);
        expect(hi.pgadFloor).to.equal(0.6);
        expect(hi.s1MaxDirFactor).to.equal(1.0);
        expect(hi.s1dPercentileFactor).to.equal(1.8);
        expect(hi.s1dFloor).to.equal(0.6);
        expect(hi.ssMaxDirFactor).to.equal(1.0);
        expect(hi.ssdPercentileFactor).to.equal(1.8);
        expect(hi.ssdFloor).to.equal(1.5);
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });

    it('returns NEHRP-2015 metadata', (done) => {
      factory.getData('NEHRP-2015', 'COUS0P01').then((results) => {
        expect(results.pgadPercentileFactor).to.equal(1.8);
      }).catch((err) => {
        return err;
      }).then((err) => {
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
        factory.getRegion(70, -170, 'ASCE7-16'),
        factory.getRegion(35, -105, 'ASCE7-16'),
        factory.getRegion(20, -160, 'ASCE7-16'),
        factory.getRegion(18, -66, 'ASCE7-16'),
        factory.getRegion(-18, -175, 'ASCE7-16'),
        factory.getRegion(18, 140, 'ASCE7-16'),
      ]).then((results) => {
        expect(results[0]).to.equal('AK0P05');
        expect(results[1]).to.equal('COUS0P01');
        expect(results[2]).to.equal('HI0P02');
        expect(results[3]).to.equal('PRVI0P01');
        expect(results[4]).to.equal('AMSAM0P10');
        expect(results[5]).to.equal('GNMI0P10');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

});
