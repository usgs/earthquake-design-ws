/* global describe, it */
'use strict';


const NEHRP2009Factory = require('../src/lib/nehrp-2009-factory'),
    expect = require('chai').expect;


describe('nehrp2009-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NEHRP2009Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(NEHRP2009Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = NEHRP2009Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });
  });
});
