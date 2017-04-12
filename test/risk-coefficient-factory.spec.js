/* global afterEach, beforeEach, describe, it */
'use strict';


var RiskCoefficientFactory = require('../src/lib/risk-coefficient-factory'),
    expect = require('chai').expect,
    NumberUtils = require('../src/lib/util/number-utils').instance,
    sinon = require('sinon');


describe('probabilistic-factory', () => {
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

      sinon.spy(factory, 'getMetadata');
      sinon.spy(factory, 'getMappedData');

      result = factory.getRiskCoefficientData({
        latitude: 0,
        longitude: 1
      });

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.getMetadata.callCount).to.equal(1);
        expect(factory.getMappedData.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getMetadata.restore();
          factory.getMappedData.restore();
        } catch (e) {
          err = (err ? [err, e] : e);
        }

        done(err);
      });
    });
  });

  describe('getDocument', () => {
    it('returns a promise and queries the database', (done) => {
      var result;

      sinon.spy(factory.db, 'query');
      result = factory.getDocument({referenceDocument: 'foo'}, {id: 1});

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);


        /* eslint-disable */
        console.log(factory.db.query.getCall(0).args);
        console.log(RiskCoefficientFactory.QUERY_DOCUMENT);
        /* eslint-enable */


        expect(factory.db.query.calledWith(
            RiskCoefficientFactory.QUERY_DOCUMENT, [1, 'foo'])).to.be.true;
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

  describe('getMappedData', () => {
    it('returns a promise and queries the database', (done) => {
      var inputs,
          metadata,
          result;

      inputs = {
        latitude: 0,
        longitude: 0
      };

      metadata = {
        document: {
          interpolation_method: 'linear'
        },
        region: {
          grid_spacing: 1,
          id: 1
        }
      };

      sinon.spy(factory.db, 'query');
      sinon.spy(factory, 'interpolate');
      result = factory.getMappedData(metadata, inputs);

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.interpolate.callCount).to.equal(1);
        expect(factory.db.query.calledWith(
            RiskCoefficientFactory.QUERY_DATA, [1, 0, 0, 1])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
          factory.interpolate.restore();
        } catch (e) {
          err = (err ? [err, e] : e);
        }

        done(err);
      });
    });
  });

  describe('getMetadata', () => {
    it('returns a promise and calls correct sub-methods', (done) => {
      var inputs,
          result;

      inputs = {
        latitude: 0,
        longitude: 0,
        referenceDocument: 'foo'
      };

      sinon.spy(factory, 'getRegion');
      sinon.spy(factory, 'getDocument');
      result = factory.getMetadata(inputs);

      expect(result).to.be.instanceof(Promise);
      result.then((metadata) => {
        expect(metadata.hasOwnProperty('region')).to.be.true;
        expect(metadata.hasOwnProperty('document')).to.be.true;

        expect(factory.getRegion.callCount).to.equal(1);
        expect(factory.getDocument.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getRegion.restore();
          factory.getDocument.restore();
        } catch (e) {
          err = (err ? [err, e] : e);
        }

        done(err);
      });
    });
  });

  describe('getRegion', () => {
    it('returns a promise and queries the database', (done) => {
      var result;

      sinon.spy(factory.db, 'query');
      result = factory.getRegion({latitude: 0, longitude: 1});

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(
            RiskCoefficientFactory.QUERY_REGION, [0, 1])).to.be.true;
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

  describe('interpolate', () => {
    it('defers to NumberUtils', () => {
      sinon.spy(NumberUtils, 'spatialInterpolate');

      factory.interpolate(
        [{latitude: 0,longitude: 0}],
        {latitude: 0, longitude: 0},
        {document: {interpolation_method: 'foo'}}
      );

      expect(NumberUtils.spatialInterpolate.callCount).to.equal(1);

      NumberUtils.spatialInterpolate.restore();
    });
  });
});