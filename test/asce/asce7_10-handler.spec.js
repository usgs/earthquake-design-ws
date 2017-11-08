/* global describe, it */
'use strict';


const DesignHandler = require('../../src/lib/asce/asce7_10-handler'),
    expect = require('chai').expect;


describe('asce7-10-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });
  });
});
