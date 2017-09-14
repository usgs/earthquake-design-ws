/* global describe, it */
'use strict';

const ASCE7_05Handler = require('../src/lib/asce7_05-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('asce7_05-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE7_05Handler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE7_05Handler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      let handler;

      handler = ASCE7_05Handler();

      expect(handler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE7-05';
      handler = ASCE7_05Handler({
        factory: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });
});
