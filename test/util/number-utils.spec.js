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

  describe('interpolate', () => {
    it('is correct when method is linear', () => {
      expect(util.interpolate(0, 0, 1, 1, 0.5)).to.equal(0.5);
    });

    it('is correct when method is log-space', () => {
      expect(util.interpolate(Math.exp(0), Math.exp(0),
          Math.exp(1), Math.exp(1), Math.exp(0.5), util.INTERPOLATE_USING_LOG))
          .to.be.closeTo(Math.exp(0.5), EPSILON);
    });

    it('throws error for y-value = 0, using log-space interpolation', () => {
      var throwError;

      throwError = () => {
        util.interpolateValue(0, 0, 1, 1, 0.5, util.INTERPOLATE_USING_LOG);
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
});
