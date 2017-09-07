/* global afterEach, beforeEach, describe, it */
'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    TargetGroundMotion = require('../src/lib/target-ground-motion');

describe('target-ground-motion', () => {
  var afe,
      curve,
      highAfe,
      lowAfe,
      targetGroundMotion;

  afe = 0.09;
  curve = [
    [1, 0.999],
    [2, 0.450],
    [3, 0.100],
    [4, 0.075],
    [5, 0.035],
    [6, 0.015],
    [7, 0.005],
    [8, 0.002],
    [9, 0.001],
  ];

  highAfe = 11;
  lowAfe = -1;


  beforeEach(() => {
    targetGroundMotion = TargetGroundMotion();
  });

  afterEach(() => {
    targetGroundMotion.destroy();
  });

  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof TargetGroundMotion).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(TargetGroundMotion).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var targetGroundMotion;

        targetGroundMotion = TargetGroundMotion();
        targetGroundMotion.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('findBounds', () => {
    it('finds correct bounds', () => {
      var points;

      points = [[3, 0.100], [4, 0.075]];

      expect(targetGroundMotion.findBounds(curve, afe)).to.deep.equal(points);
    });

    it('throw error when afe value is below the curve range', () => {
      expect(() => targetGroundMotion.findBounds(curve, lowAfe)).
          to.throw(Error);
    });

    it('throw error when afe value is above the curve range', () => {
      expect(() => targetGroundMotion.findBounds(curve, highAfe)).
          to.throw(Error);
    });

  });

  describe('getFrequencyForProbability', () => {
    var probability,
        years;

    probability = .20;
    years = 25;

    it('computes correct afe value when years are not given', () => {
      expect(targetGroundMotion.getFrequencyForProbability(probability)).
          to.equal(0.004462871026284194);
    });

    it('computes correct afe value when years are given', () => {
      expect(targetGroundMotion.getFrequencyForProbability(probability, years)).
          to.equal(0.008925742052568388);
    });
  });

  describe('getTargetedGroundMotion', () => {
    it('calls all methods as expected', () => {
      sinon.spy(targetGroundMotion, 'getFrequencyForProbability');
      sinon.spy(targetGroundMotion, 'findBounds');
      sinon.spy(targetGroundMotion.numberUtils, 'interpolate');

      targetGroundMotion.getTargetedGroundMotion(curve, 0.99999);

      expect(targetGroundMotion.getFrequencyForProbability.callCount)
        .to.equal(1);
      expect(targetGroundMotion.findBounds.callCount).to.equal(1);
      expect(targetGroundMotion.numberUtils.interpolate.callCount).to.equal(1);
      expect(targetGroundMotion.numberUtils.interpolate.calledWith(
          0.45, 2, 0.1, 3)).to.be.true;

      targetGroundMotion.getFrequencyForProbability.restore();
      targetGroundMotion.findBounds.restore();
      targetGroundMotion.numberUtils.interpolate.restore();
    });
  });
});
