/* global describe, it */
'use strict';


const ASCE7_10Factory = require('../src/lib/asce7_10-factory'),
    expect = require('chai').expect;


describe('asce7_10-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_10Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(ASCE7_10Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = ASCE7_10Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = ASCE7_10Factory();
      expect(factory.referenceDocument).to.equal('ASCE7-10');
    });
  });
});
