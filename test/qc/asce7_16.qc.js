/* global after, before, describe, it */
'use strict';


var ASCE7_16Handler = require('../../src/lib/asce7_16-handler'),
    CityInputs = require('../../etc/asce7_16-qc.json'),
    Config = require('../../src/conf/config.json'),
    expect = require('chai').expect;


var compareResult,
    epsilon;

epsilon = Config.epsilon || 1E-4;

compareResult = function (expected, actual) {
  if (expected.hasOwnProperty('sms')) {
    if (expected.sms === null) {
      expect(actual.sms).to.equal(null);
    } else {
      expect(actual.sms).to.be.closeTo(expected.sms, epsilon);
    }
  }

  if (expected.hasOwnProperty('sm1')) {
    if (expected.sm1 === null) {
      expect(actual.sm1).to.equal(null);
    } else {
      expect(actual.sm1).to.be.closeTo(expected.sm1, epsilon);
    }
  }

  if (expected.hasOwnProperty('pgam')) {
    if (expected.pgam === null) {
      expect(actual.pgam).to.equal(null);
    } else {
      expect(actual.pgam).to.be.closeTo(expected.pgam, epsilon);
    }
  }
};


describe(`ASCE 7-16 Quality Control Tests +/- ${epsilon}`, () => {
  var handler;

  before(() => {
    handler = ASCE7_16Handler(Config);
  });

  after(() => {
    handler.destroy();
    handler = null;
  });

  CityInputs.forEach((city) => {
    var label,
        latitude,
        longitude,
        riskCategory,
        title;

    label = city.request.parameters.label;
    latitude = city.request.parameters.latitude;
    longitude = city.request.parameters.longitude;
    riskCategory = 'I';
    title = 'QC_Test-ASCE7_16Handler';
    label = `${label} (${latitude}, ${longitude})`;

    describe(label, () => {
      var cityResponse,
          i,
          len,
          siteClass;

      len = city.response.data.length;
      for (i = 0; i < len; i++) {
        cityResponse = city.response.data[i];
        siteClass = cityResponse.siteClass;


        it(JSON.stringify(cityResponse), (done) => {
          var request;

          request = {
            latitude: latitude,
            longitude: longitude,
            siteClass: siteClass,
            riskCategory: riskCategory,
            title: title
          };

          handler.get(request).then((result) => {
            compareResult(cityResponse, result.data);
          }).catch((err) => {
            process.stderr.write(err.stack + '\n');
            return err;
          }).then(done);
        });
      }
    });
  });
});
