/* global after, before, describe, it */
'use strict';


const ASCE41_13Handler = require('../../src/lib/asce41_13-handler'),
    // ASCE41_17Handler = require('../../src/lib/asce41_17-handler'),
    ASCE41_13CityInputs = require('../../etc/asce41_13-qc.json'),
    // ASCE41_17CityInputs = require('../../etc/asce41_17-qc.json'),
    expect = require('chai').expect,
    extend = require('extend'),
    fs = require('fs'),
    https = require('https');

const ASCE41_HANDlERS = [
  {
    handler: ASCE41_13Handler,
    name: 'ASCE 41-13',
    data: ASCE41_13CityInputs
  }/*,
  {
    handler: ASCE41_17Handler,
    name: 'ASCE 41-17',
    data: ASCE41_17CityInputs
  }*/
];

let Config = require('../../src/conf/config.json'),
    ca,
    compareResults;

const epsilon = Config.epsilon || 1E-4;


// Override generic configuration properties with site-specific properties
// as applicable.
if (Config.hasOwnProperty('database')) {
  Config.DB_HOST = Config.database;
}

if (Config.hasOwnProperty('pgsql_read_only_user')) {
  Config.DB_USER = Config.pgsql_read_only_user;
}

if (Config.hasOwnProperty('pgsql_read_only_password')) {
  Config.DB_PASSWORD = Config.pgsql_read_only_password;
}

// Config custom certificate chain
if (Config.SSL_CERT_FILE) {
  ca = fs.readFileSync(Config.SSL_CERT_FILE, 'utf-8');
  ca = ca.split('-----END CERTIFICATE-----').map((c) => {
    return c + '-----END CERTIFICATE-----';
  });
  https.globalAgent.options.ca = ca;
}

compareResults = function (expected, actual) {
  expect(actual.sxs).to.be.closeTo(expected.sxs, epsilon);
  expect(actual.sx1).to.be.closeTo(expected.sx1, epsilon);
};

ASCE41_HANDlERS.forEach(function(asce41_handler) {
  describe(asce41_handler.name +
    ` Quality Control Tests +/- ${epsilon}`, function () {
    let handler;

    this.timeout(100000);

    after(() => {
      handler.destroy();
      handler = null;
    });

    before(() => {
      handler = asce41_handler.handler(Config);
    });

    asce41_handler.data.forEach((city) => {
      let label,
          latitude,
          longitude,
          siteClass;

      label = city.request.parameters.label;
      latitude = city.request.parameters.latitude;
      longitude = city.request.parameters.longitude;
      siteClass = city.request.parameters.siteClass;

      label = `${label} (${latitude}, ${longitude}) "Site Class ${siteClass}"`;

      describe(label, () => {
        let customResults,
            standardResults;

        before((done) => {
          let customRequest,
              standardRequest;

          standardRequest = {
            latitude: latitude,
            longitude: longitude,
            siteClass: siteClass
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
            process.stderr.write(err.stack + '\n');
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
});
