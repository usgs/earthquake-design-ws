/* global describe, it */
'use strict';


const IBC2015Factory = require('../src/lib/ibc-2015-factory'),
    expect = require('chai').expect;


describe('ibc-2015-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof IBC2015Factory).to.not.equal('undefined');
    });

    it('can be instantiated', () => {
      expect(IBC2015Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = IBC2015Factory();
      expect(factory.destroy).to.not.throw(Error);
      factory.destroy();
    });
  });
});
