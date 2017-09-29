/* global describe, it */
'use strict';


const IBC2012Factory = require('../src/lib/ibc-2012-factory'),
    expect = require('chai').expect;


describe('ibc-2012-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof IBC2012Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(IBC2012Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = IBC2012Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });

    it('Sets the correct referenceDocument value', () => {

      const factory = IBC2012Factory();
      expect(factory.referenceDocument).to.equal('IBC-2012');
    });
  });
});
