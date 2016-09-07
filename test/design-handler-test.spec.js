/* global describe, it */
'use strict';

var DesignHandler = require('../../src/handler/design-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


var validParams = {
  "title": 'This is a title',
  "latitude": 30,
  "longitude": 80,
  "referenceDocument": 'Building code',
  "siteClass": 'site class B',
  "riskCategory": 3
};

var invalidaParams = {
  "title": null,
  "latitude": null,
  "longitude": ,
  "referenceDocument": null,
  "siteClass": null,
  "riskCategory": null
};

describe('design-handler-test', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var designHandler;

      designHandler = DesignHandler();

      expect(handler.destroy).to.not.throw(Error);
    });
  });
};
