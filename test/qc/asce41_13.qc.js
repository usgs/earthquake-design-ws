/* global after, before, describe, it */
'use strict';


var ASCE41_13Handler = require('../../src/lib/asce41_13-handler'),
    CityInputs = require('../../etc/asce41_13-qc.json'),
    Config = require('../../src/conf/config.json'),
    expect = require('chai').expect,
    extend = require('extend');


var compareResults,
    epsilon;

epsilon = Config.epsilon || 1E-4;

compareResults = function (expected, actual) {
  expect(actual.sxs).to.be.closeTo(expected.sxs, epsilon);
  expect(actual.sx1).to.be.closeTo(expected.sx1, epsilon);
};


describe(`ASCE 41-13 Quality Control Tests +/- ${epsilon}`, () => {
  var handler;

  after(() => {
    handler.destroy();
    handler = null;
  });

  before(() => {
    handler = ASCE41_13Handler(Config);
  });

  CityInputs.forEach((city) => {
    describe(`${city.request.parameters.label} (${city.request.parameters.latitude}, ${city.request.parameters.longitude})`, () => {
      var customResults,
          standardResults;

      before((done) => {
        var customRequest,
            standardRequest;

        standardRequest = {
          latitude: city.request.parameters.latitude,
          longitude: city.request.parameters.longitude,
          siteClass: city.request.parameters.siteClass
        };

        customRequest = extend({
          customProbability: city.response.data[4].customProbability
        }, standardRequest);

        Promise.all([
          handler.get(standardRequest),
          handler.get(customRequest)
        ]).then((results) => {
          standardResults = results[0];
          customResults = results[1];
        }).catch((err) => {
          return err;
        }).then(done);
      });

      it('BSE-2N ' + JSON.stringify(city.response.data[0]), () => {
        compareResults(city.response.data[0], standardResults.data[0]);
      });
      it('BSE-1N ' + JSON.stringify(city.response.data[1]), () => {
        compareResults(city.response.data[1], standardResults.data[1]);
      });
      it('BSE-2E ' + JSON.stringify(city.response.data[2]), () => {
        compareResults(city.response.data[2], standardResults.data[2]);
      });
      it('BSE-1E ' + JSON.stringify(city.response.data[3]), () => {
        compareResults(city.response.data[3], standardResults.data[3]);
      });
      it('Custom ' + JSON.stringify(city.response.data[4]), () => {
        compareResults(city.response.data[4], customResults.data[0]);
      });
    });
  });
});