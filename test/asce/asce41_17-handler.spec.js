/* global describe, it */
'use strict';


const ASCE41_17Handler = require('../../src/lib/asce/asce41_17-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce41_17-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_17Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_17Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const handler = ASCE41_17Handler();
      expect(handler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE41-17';
      handler = ASCE41_17Handler({
        factory: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });
});
