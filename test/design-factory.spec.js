/* global describe, it */
'use strict';


var DesignFactory = require('../src/lib/design-factory.js'),
    expect = require('chai').expect;


describe('DesignFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = DesignFactory();
        factory.destroy();
      }).to.not.throw(Error);
    });
  });
});
