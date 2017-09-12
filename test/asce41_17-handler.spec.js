/* global describe, it */
'use strict';


const ASCE41_17Handler = require('../src/lib/asce41_17-handler'),
    expect = require('chai').expect;


describe('asce41_17-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_17Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_17Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = ASCE41_17Handler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });
});
