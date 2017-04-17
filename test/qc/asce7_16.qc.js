/* global after, before, describe, it */
'use strict';


var ASCE7_16Handler = require('../../src/lib/asce7_16-handler'),
    CityInputs = require('../../etc/asce7_16-qc.json'),
    Config = require('../../src/conf/config.json'),
    expect = require('chai').expect;


var compareResult,
    epsilon;

epsilon = Config.epsilon || 1E-4;

compareResult = function (expected, actual, key) {
  expect(actual.data[key]).to.be.closeTo(expected[key], epsilon);
};


describe(`ASCE 7-16 Quality Control Tests +/- ${epsilon}`, () => {
  var handler;

  handler = ASCE7_16Handler(Config);

  after(() => {
    handler.destroy();
    handler = null;
  });

  CityInputs.forEach((city) => {
    describe(`${city.name} (${city.latitude}, ${city.longitude})`, function () {
      var actual;

      // Allow up to 5 seconds response time
      this.timeout(5000);

      before((done) => {
        handler.get({
          latitude: city.latitude,
          longitude: city.longitude,
          riskCategory: 'I',
          siteClass: 'B (unmeasured)',
          title: 'QC_Test-ASCE7_16Handler'
        }).then((result) => {
          actual = result;
        }).catch((err) => {
          return err;
        }).then(done);
      });

      it('Computes PGA correctly', () => {
        compareResult(city, actual, 'pga');
      });
      it('Computes S1 correctly', () => {
        compareResult(city, actual, 's1');
      });
      it('Computes Ss correctly', () => {
        compareResult(city, actual, 'ss');
      });
    });
  });
});
