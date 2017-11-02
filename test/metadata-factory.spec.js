/* global afterEach, beforeEach, describe, it */
'use strict';


const expect = require('chai').expect,
    MetadataFactory = require('../src/lib/metadata-factory'),
    sinon = require('sinon');

const _DUMMY_INPUTS = {
  latitude: 35,
  longitude: -105,
  referenceDocument: 'ASCE7-10'
};

const _DUMMY_DB = {
  query: () => {return Promise.resolve({
    'response': {
      'data': {
        'spatialInterpolationMethod': 'linearlinearlinear',
        'modelVersion': 'v3.1.x',
        'regionName': 'E2008R2_COUS0P01_Probabilistic',
        'gridSpacing': 0.01
      }
    }
  }); }
};

describe('MetadataFactory', () => {
  let factory;

  beforeEach(() => {
    factory = MetadataFactory({
      'db': _DUMMY_DB
    });
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
      expect(factory.getMetadata(_DUMMY_INPUTS)).to.be.an.instanceof(Promise);
    });

    it('calls each factory method', (done) => {
      let result;

      sinon.stub(factory, 'getData').callsFake(() => {
        return Promise.resolve();
      });

      sinon.stub(factory, 'getRegion').callsFake(() => {
        return Promise.resolve();
      });

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

    it('queries the database', (done) => {
      let factory,
          getDataResults,
          referenceDocument,
          region;

      getDataResults = {
        'rows': [
          {
            'id': 3,
            'document_id': 2,
            'key': 'modelVersion',
            'value': 'v2.0.x'
          },
          {
            'id': 4,
            'document_id': 2,
            'key': 'spatialInterpolationMethod',
            'value': 'linearlinearlinear'
          }
        ]
      };
      referenceDocument = 'ASCE7-05';
      region = 'CANV0P01';

      factory = MetadataFactory({
        db: {
          query: () => { return Promise.resolve(); }
        }
      });

      sinon.stub(factory.db, 'query').callsFake(() => {
        return Promise.resolve(getDataResults);
      });

      sinon.spy(factory, 'getData');

      factory.getData(referenceDocument, region).then((data) => {

        // check params
        expect(factory.getData.calledWith(referenceDocument, region)).to.be.true;

        // check query
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryData,
            [referenceDocument, region])).to.be.true;

        // check metadata results
        expect(data).to.deep.equal({
          'modelVersion': 'v2.0.x',
          'spatialInterpolationMethod': 'linearlinearlinear'
        });

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

  describe('getRegion', () => {
    it ('returns a promise', () => {
      expect(factory.getRegion()).to.be.an.instanceof(Promise);
    });

    it('queries the database', (done) => {
      let factory,
          getRegionResults,
          latitude,
          longitude,
          referenceDocument;

      getRegionResults = {
        'rows': [
          {
            'id': 4,
            'grid_spacing': 0.01,
            'max_latitude': 42,
            'max_longitude': -115,
            'min_latitude': 32,
            'min_longitude': -125,
            'name': 'CANV0P01'
          },
          {
            'id': 13,
            'grid_spacing': 0.05,
            'max_latitude': 50,
            'max_longitude': -65,
            'min_latitude': 24.6,
            'min_longitude': -125,
            'name': 'US0P05'
          }
        ]
      };
      referenceDocument = 'ASCE7-05';
      latitude = 35;
      longitude = -118;

      factory = MetadataFactory({
        db: {
          query: () => { return Promise.resolve(); }
        }
      });

      sinon.stub(factory.db, 'query').callsFake(() => {
        return Promise.resolve(getRegionResults);
      });

      sinon.spy(factory, '_computeRegionArea');
      sinon.spy(factory, 'getRegion');

      factory.getRegion(latitude, longitude, referenceDocument).then((region) => {

        // check params
        expect(factory.getRegion.calledWith(latitude, longitude,
            referenceDocument)).to.be.true;

        // check query
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryRegion,
            [latitude, longitude, referenceDocument])).to.be.true;

        // check submethods are called
        expect(factory._computeRegionArea.callCount).to.equal(2);

        // check region results
        expect(region).to.deep.equal(getRegionResults.rows[0].id);

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

});
