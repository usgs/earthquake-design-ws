/* global describe, it */
'use strict';


var expect = require('chai').expect,
    MetadataFactory = require('../src/lib/metadata-factory');


describe('MetadataFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof MetadataFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(MetadataFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = MetadataFactory();
        factory.destroy();
        factory = null;
      }).to.not.throw(Error);
    });
  });
});