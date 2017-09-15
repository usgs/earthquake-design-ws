/* global describe, it */
'use strict';

const RiskCoefficientHandler = require('../src/lib/risk-coefficient-handler'),
    expect = require('chai').expect;


describe('risk-coefficient-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof RiskCoefficientHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(RiskCoefficientHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const handler = RiskCoefficientHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });
});