/* global describe, it */
'use strict';


const NEHRP2015Factory = require('../../src/lib/nehrp/nehrp-2015-factory'),
    expect = require('chai').expect;


describe('nehrp-2015-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NEHRP2015Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(NEHRP2015Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = NEHRP2015Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = NEHRP2015Factory();
      expect(factory.referenceDocument).to.equal('NEHRP-2015');
    });
  });
});
