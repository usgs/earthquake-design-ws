/* global after, before, describe, it */
'use strict';


var expect = require('chai').expect,
    NumberUtils = require('../../src/lib/util/number-utils'),
    sinon = require('sinon');


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
