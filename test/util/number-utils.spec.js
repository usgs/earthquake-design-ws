/* global after, before, describe, it */
'use strict';


var expect = require('chai').expect,
    NumberUtils = require('../../src/lib/util/number-utils'),
    sinon = require('sinon');


var EPSILON;

EPSILON = 1E-10;

describe('util/number-utils', () => {
  var util;

  after(() => {
    util.destroy();
  });

  before(() => {
    util = NumberUtils();
  });


  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NumberUtils).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(NumberUtils).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var destroyTest;

      destroyTest = function () {
        var localUtil;

        localUtil = NumberUtils();
        localUtil.destroy();
      };

      expect(destroyTest).to.not.throw(Error);
    });
  });

  describe('closeTo', () => {
    it('returns true when values are close', () => {
      var epsilon;

      // Using default epsilon
      epsilon = util.epsilon;
      expect(util.closeTo(0, 0)).to.be.true;
      expect(util.closeTo(0, 0 + epsilon)).to.be.true;

      // Using custom epsilon
      epsilon = epsilon * 2;
      expect(util.closeTo(0, 0, epsilon)).to.be.true;
      expect(util.closeTo(0, 0 + epsilon, epsilon)).to.be.true;
    });

    it('returns false when values are not close', () => {
      var epsilon;

      // Using default epsilon
      epsilon = util.epsilon;
      expect(util.closeTo(Math.MAX_VALUE, Math.MIN_VALUE)).to.be.false;
      expect(util.closeTo(0, 0 + (epsilon * 3 / 2))).to.be.false;

      // Using custom epsilon
      epsilon = epsilon / 2;
      expect(util.closeTo(Math.MAX_VALUE, Math.MIN_VALUE, epsilon)).to.be.false;
      expect(util.closeTo(0, 0 + (epsilon * 3 / 2), epsilon)).to.be.false;
    });
  });


  describe('getGridPoints', () => {
    // NOTE that the tests below also verify the correct point return order
    // (top to bottom, left to right)

    it('returns one point when on grid', () => {
      var points;

      points = util.getGridPoints({
        gridSpacing: 0.05,
        latitude: 34.05,
        longitude: -118.05
      });

      expect(points.length).to.equal(1);
      expect(points).to.deep.equal([
        {
          latitude: 34.05,
          longitude: -118.05
        }
      ]);
    });

    it('returns two points when on vertical line between grid', () => {
      var points;

      points = util.getGridPoints({
        gridSpacing: 0.05,
        latitude: 34.06,
        longitude: -118.05
      });

      expect(points.length).to.equal(2);
      expect(points).to.deep.equal([
        {
          latitude: 34.10,
          longitude: -118.05
        },
        {
          latitude: 34.05,
          longitude: -118.05
        }
      ]);
    });

    it('returns two points when on horizontal line between grid', () => {
      var points;

      points = util.getGridPoints({
        gridSpacing: 0.02,
        latitude: 34.04,
        longitude: -118.05
      });

      expect(points.length).to.equal(2);
      expect(points).to.deep.equal([
        {
          latitude: 34.04,
          longitude: -118.06
        },
        {
          latitude: 34.04,
          longitude: -118.04
        }
      ]);
    });

    it('returns four points when off grid', () => {
      var points;

      points = util.getGridPoints({
        gridSpacing: 0.1,
        latitude: 34.05,
        longitude: -118.05
      });

      expect(points.length).to.equal(4);
      expect(points).to.deep.equal([
        {
          latitude: 34.1,
          longitude: -118.1
        },
        {
          latitude: 34.1,
          longitude: -118.0
        },
        {
          latitude: 34.0,
          longitude: -118.1
        },
        {
          latitude: 34.0,
          longitude: -118.0
        }
      ]);
    });
  });

  describe('interpolate', () => {
    it('is correct when method is linear', () => {
      expect(util.interpolate(0, 0, 1, 1, 0.5)).to.equal(0.5);
    });

    it('is correct when method is log-space', () => {
      expect(util.interpolate(Math.exp(0), Math.exp(0),
          Math.exp(1), Math.exp(1), Math.exp(0.5), util.INTERPOLATE_LOGX_LOGY_LINEAR))
          .to.be.closeTo(Math.exp(0.5), EPSILON);
    });

    it('throws error for y-value = 0, using log-space interpolation', () => {
      var throwError;

      throwError = () => {
        util.interpolateValue(0, 0, 1, 1, 0.5, util.INTERPOLATE_LOGX_LOGY_LINEAR);
      };

      expect(throwError).to.throw(Error);
    });
  });

  describe('interpolateObject', () => {
    it('calls interpolate method proper number of times', () => {
      var obj0,
          obj1,
          result;

      obj0 = {
        key1: 0,
        key2: 0,
        key3: 0
      };

      obj1 = {
        key1: 1,
        key2: 1,
        key4: 0
      };

      sinon.spy(util, 'interpolate');

      result = util.interpolateObject(0, obj0, 1, obj1, 0.5);
      expect(util.interpolate.callCount).to.equal(2);
      expect(result).to.deep.equal({key1: 0.5, key2: 0.5});

      util.interpolate.restore();
    });
  });

  describe('round', () => {
    it('returns null if param value is null', () => {
      expect(util.round(null, 3)).to.equal(null);
    });

    it('rounds correctly', () => {
      expect(util.round(0.0005, 3)).to.equal(0.001);
      expect(util.round(0.0015, 3)).to.equal(0.002);
      expect(util.round(0.00349, 3)).to.equal(0.003);
    });
  });

  describe('roundSpectrum', () => {
    it('calls roundOutput the proper number of times', () => {
      var spectrum;

      spectrum = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
      ];

      sinon.spy(util, 'round');

      util.roundSpectrum(spectrum);
      expect(util.round.callCount).to.equal(spectrum.length * 2);

      util.round.restore();
    });
  });

  describe('spatialInterpolate', () => {
    it('1-point no match', () => {
      var points;

      points = [];
      points.push({
        latitude: 0,
        longitude: 0,
        value: 0.5
      });

      expect(() => {util.spatialInterpolate(points, 1, 1);}).to.throw(Error);
    });

    it('1-point match', () => {
      var points;

      points = [];
      points.push({
        latitude: 1,
        longitude: 1,
        value: 0.5
      });

      expect(util.spatialInterpolate(points, 1, 1)).to.deep.equal(points[0]);
    });

    it('2-point no match', () => {
      var points;

      points = [];

      // Neither latitude/longitude match for these points so all calls
      // should throw error regardless of target point coordinate
      points.push({
        latitude: 0,
        longitude: 1,
        value: 0
      });

      points.push({
        latitude: 2,
        longitude: 3,
        value: 0
      });

      // Point does not match any latitude/longitude value
      expect(() => {util.spatialInterpolate(points, 1, 2);}).to.throw(Error);
      // Point matches latitude of first, but still an error (b/c points...)
      expect(() => {util.spatialInterpolate(points, 0, 2);}).to.throw(Error);
      // Point matches longitude of first, but still an error (b/c points...)
      expect(() => {util.spatialInterpolate(points, 1, 0);}).to.throw(Error);
    });

    it('2-point match latitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 0,
        longitude: 1,
        value: 1
      });

      expect(util.spatialInterpolate(points, 0, 0.5)).to.deep.equal({
        latitude: 0,
        longitude: 0.5,
        value: 0.5
      });
    });

    it('2-point match longitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 1,
        longitude: 0,
        value: 1
      });

      expect(util.spatialInterpolate(points, 0.5, 0)).to.deep.equal({
        latitude: 0.5,
        longitude: 0,
        value: 0.5
      });
    });

    it('4-point no match top latitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 2,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 3,
        longitude: 1,
        value: 1
      });

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 0,
        longitude: 1,
        value: 1
      });

      expect(() => {util.spatialInterpolate(points, 2, 0.5);}).to.throw(Error);
    });

    it('4-point no match bottom latitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 2,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 2,
        longitude: 1,
        value: 1
      });

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 1,
        longitude: 1,
        value: 1
      });

      expect(() => {util.spatialInterpolate(points, 2, 0.5);}).to.throw(Error);
    });

    it('4-point no match left longitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 2,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 2,
        longitude: 2,
        value: 1
      });

      points.push({
        latitude: 0,
        longitude: 1,
        value: 0
      });

      points.push({
        latitude: 0,
        longitude: 2,
        value: 1
      });

      expect(() => {util.spatialInterpolate(points, 1, 1);}).to.throw(Error);
    });

    it('4-point no match left longitude', () => {
      var points;

      points = [];

      points.push({
        latitude: 2,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 2,
        longitude: 1,
        value: 1
      });

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 0,
        longitude: 2,
        value: 1
      });

      expect(() => {util.spatialInterpolate(points, 1, 1);}).to.throw(Error);
    });

    it('4-point match all', () => {
      var points;

      points = [];

      points.push({
        latitude: 2,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 2,
        longitude: 2,
        value: 3
      });

      points.push({
        latitude: 0,
        longitude: 0,
        value: 0
      });

      points.push({
        latitude: 0,
        longitude: 2,
        value: 1
      });

      expect(util.spatialInterpolate(points, 1, 1)).to.deep.equal({
        latitude: 1,
        longitude: 1,
        value: 1
      });
    });
  });
});
