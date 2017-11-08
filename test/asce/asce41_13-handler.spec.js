/* global describe, it */
'use strict';

const ASCE41_13Handler = require('../../src/lib/asce/asce41_13-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce41_13-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_13Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_13Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const handler = ASCE41_13Handler();

      expect(handler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE41-13';
      handler = ASCE41_13Handler({
        factory: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });
});
