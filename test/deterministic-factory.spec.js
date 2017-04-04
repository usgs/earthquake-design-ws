/* global afterEach, beforeEach, describe, it */
'use strict';


var DeterministicFactory = require('../src/lib/deterministic-factory'),
    expect = require('chai').expect,
    extend = require('extend'),
    NumberUtils = require('../src/lib/util/number-utils').instance,
    sinon = require('sinon');


describe('deterministic-factory', () => {
  var factory;


  afterEach(() => {
    factory.destroy();
    factory = null;
  });

  beforeEach(() => {
    factory = DeterministicFactory();
  });


  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DeterministicFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DeterministicFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var destroyTest;

      destroyTest = function () {
        DeterministicFactory().destroy();
      };

      expect(destroyTest).to.not.throw(Error);
    });
  });

  describe('computeResult', () => {
    var data,
        metadata;


    afterEach(() => {
      data = null;
      metadata = null;
    });

    beforeEach(() => {
      data = {
        mapped_pgad: 1,
        mapped_s1d: 2,
        mapped_ssd: 3
      };

      metadata = {
        document: {
          percentile_pgad: 1.5,
          percentile_s1d: 2.0,
          percentile_ssd: 2.5,
          floor_pgad: 2,
          floor_s1d: 3,
          floor_ssd: 5
        }
      };
    });


    it('returns a promise', () => {
      expect(factory.computeResult(metadata, data)).to.be.instanceof(Promise);
    });

    it('resolves with expected results', (done) => {
      var expected;

      expected = {
        data: extend(true, {}, data, {pgad: 2, s1d: 4, ssd: 7.5}),
        metadata: metadata
      };

      factory.computeResult(metadata, data).then((result) => {
        expect(result).to.deep.equal(expected);
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('getDeterministicData', () => {
    it('returns a promise and calls functions as intended', (done) => {
      var result;

      sinon.spy(factory, 'getMetadata');
      sinon.spy(factory, 'getMappedData');
      sinon.spy(factory, 'computeResult');

      result = factory.getDeterministicData({
        latitude: 0,
        longitude: 1
      });

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.getMetadata.callCount).to.equal(1);
        expect(factory.getMappedData.callCount).to.equal(1);
        expect(factory.computeResult.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getMetadata.restore();
          factory.getMappedData.restore();
          factory.computeResult.restore();
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
        expect(factory.db.query.calledWith(
            DeterministicFactory.QUERY_DOCUMENT, [1, 'foo'])).to.be.true;
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
            DeterministicFactory.QUERY_DATA, [0, 0, 1, 1])).to.be.true;
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
            DeterministicFactory.QUERY_REGION, [0, 1])).to.be.true;
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