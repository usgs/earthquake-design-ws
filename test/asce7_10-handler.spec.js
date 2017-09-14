/* global describe, it, sinon */
'use strict';


const DesignHandler = require('../src/lib/asce7_10-handler'),
    expect = require('chai').expect;


describe('asce7-10-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      const designHandler = DesignHandler();

      expect(designHandler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE7-10';
      handler = DesignHandler({
        factory: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });
});
