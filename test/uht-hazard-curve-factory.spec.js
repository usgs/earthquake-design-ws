/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    UHTHazardCurveFactory = require('../src/lib/uht-hazard-curve-factory');


describe('UHTHazardCurveFactory', () => {
  var factory;

  beforeEach(() => {
    factory = UHTHazardCurveFactory();
  });

  afterEach(() => {
    factory.destroy();
    factory = null;
  });

  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof UHTHazardCurveFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(UHTHazardCurveFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = UHTHazardCurveFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('getGridPoints', () => {
    // NOTE that the tests below also verify the correct point return order
    // (top to bottom, right to left)

    it('returns one point when on grid', () => {
      var points;

      points = factory.getGridPoints({
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

      points = factory.getGridPoints({
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

      points = factory.getGridPoints({
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

      points = factory.getGridPoints({
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
          longitude: -118.0
        },
        {
          latitude: 34.0,
          longitude: -118.1
        }
      ]);
    });
  });
});
