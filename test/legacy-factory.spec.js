/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    LegacyFactory = require('../src/lib/legacy-factory');


describe('LegacyFactory test suite', () => {
  var legacyFactory;

  beforeEach(() => {
    legacyFactory = LegacyFactory();
  });

  afterEach(() => {
    legacyFactory = null;
  });


  describe('Constructor', () => {
    it('is defined', () => {
      expect(typeof LegacyFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(LegacyFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var factory;

      factory = LegacyFactory();

      expect(factory.destroy).to.not.throw(Error);
    });
  });

  describe('cleanseInputs', () => {
    it('translates from the new inputs to the old inputs', () => {
      var newInputs,
          oldInputs,
          output;

      oldInputs = {
        design_code: 0,
        latitude: 1,
        longitude: 2,
        risk_category: 3,
        site_class: 4,
        title: 5
      };

      newInputs = {
        referenceDocument: 0,
        latitude: 1,
        longitude: 2,
        riskCategory: 3,
        siteClass: 4,
        title: 5
      };

      output = legacyFactory.cleanseInputs(newInputs);

      expect(output).to.deep.equal(oldInputs);
    });
  });

  describe('urlEncode', () => {
    it('builds a url with api parameters', () => {
      var factory,
          inputs,
          params,
          url;

      factory = LegacyFactory();
      inputs = {
        design_code: 0,
        site_class: 1,
        risk_category: 2,
        longitude: 3,
        latitude: 4,
        title: 5,
      };
      url = factory.urlEncode(inputs);
      params = url.split('/');

      expect(params[0]).to.equal('0');
      expect(params[1]).to.equal('1');
      expect(params[2]).to.equal('2');
      expect(params[3]).to.equal('3');
      expect(params[4]).to.equal('4');
      expect(params[5]).to.equal('5');
    });
  });
});
