/* global afterEach, beforeEach, describe, it */
'use strict';


var RiskCoefficientFactory = require('../src/lib/risk-coefficient-factory'),
    expect = require('chai').expect,
    NumberUtils = require('../src/lib/util/number-utils').instance,
    sinon = require('sinon');


describe('risk-coefficient-factory', () => {
  var factory;


  afterEach(() => {
    factory.destroy();
    factory = null;
  });

  beforeEach(() => {
    factory = RiskCoefficientFactory();
  });


  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof RiskCoefficientFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(RiskCoefficientFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var destroyTest;

      destroyTest = function () {
        RiskCoefficientFactory().destroy();
      };

      expect(destroyTest).to.not.throw(Error);
    });
  });


  describe('getRiskCoefficientData', () => {
    it('returns a promise and calls functions as intended', (done) => {
      var result;

      sinon.spy(factory, 'getGriddedData');
      sinon.spy(factory.db, 'query');
      sinon.spy(NumberUtils, 'spatialInterpolate');


      result = factory.getRiskCoefficientData({
        latitude: 35,
        longitude: -105
      });

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.getGriddedData.callCount).to.equal(1);
        expect(factory.db.query.callCount).to.equal(1);
        expect(NumberUtils.spatialInterpolate.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getGriddedData.restore();
          factory.db.query.restore();
          NumberUtils.spatialInterpolate.restore();
        } catch (e) {
          err = (err ? [err, e] : e);
        }

        done(err);
      });
    });
  });


  describe('getGriddedData', () => {
    it('returns a promise and queries the database', (done) => {
      var inputs,
          result;

      inputs = {
        'region': 1,
        'latitude': 35,
        'longitude': -105,
        'gridSpacing': 0.05
      };

      sinon.spy(factory.db, 'query');
      result = factory.getGriddedData(inputs);

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.getCall(0).args[1][0]).to.equal(inputs.region);
        expect(factory.db.query.getCall(0).args[1][1]).to.equal(inputs.latitude);
        expect(factory.db.query.getCall(0).args[1][2]).to.equal(inputs.longitude);
        expect(factory.db.query.getCall(0).args[1][3]).to.equal(inputs.gridSpacing);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = (err ? [err, e] : e);
        }

        done(err);
      });
    });
  });

});