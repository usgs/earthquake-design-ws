/* global describe, it */
'use strict';

var ProbabilisticHandler = require('../src/lib/probabilistic-handler'),
    expect = require('chai').expect;


describe('probabilistic-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ProbabilisticHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ProbabilisticHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = ProbabilisticHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });
});
