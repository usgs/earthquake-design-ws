/* global describe, it */
'use strict';


const ASCE41_17Factory = require('../../src/lib/asce/asce41_17-factory'),
    expect = require('chai').expect;


describe('asce41_17-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_17Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(ASCE41_17Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      let factory;

      factory = ASCE41_17Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });
  });
});
