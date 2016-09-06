/* global describe, it */
'use strict';


var expect = require('chai').expect,
    WebService = require('../src/lib/web-service');


describe('WebService test suite', () => {
  describe('Constructor', () => {
    it('is defined', () => {
      expect(typeof WebService).to.equal('function');
    });
  });
});
