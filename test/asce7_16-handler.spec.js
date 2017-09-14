/* global describe, it */
'use strict';


const DesignHandler = require('../src/lib/asce7_16-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce7-16-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });
  });
});
