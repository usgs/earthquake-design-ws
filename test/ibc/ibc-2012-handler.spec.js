/* global describe, it */
'use strict';


const DesignHandler = require('../../src/lib/ibc/ibc-2012-handler'),
    expect = require('chai').expect;


describe('ibc-2012-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });
  });
});
