/* global after, before, describe, it */
'use strict';


const ASCE41_13Handler = require('../../src/lib/asce41_13-handler'),
    // ASCE41_17Handler = require('../../src/lib/asce41_17-handler'),
    ASCE41_13CityInputs = require('../../etc/asce41_13-qc.json'),
    // ASCE41_17CityInputs = require('../../etc/asce41_17-qc.json'),
    Config = require('../../src/lib/util/config'),
    expect = require('chai').expect,
    extend = require('extend');

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

let config = Config().get(),
    handlerSwitch,
    handlerIndex,
    asce41_handler,
    compareResult;

const epsilon = config.epsilon || 1E-4;

/**
 * The index of the handler is passed in from the CLI from the
 * update-quality-control.sh script.  This is so distinct
 * quality control reports for each handler can be generated.
 */
handlerSwitch = (process.argv[5] === undefined) ? '--asce41-13'
  : process.argv[5];

if (handlerSwitch === '--asce41-13') {
  handlerIndex = 0;
} else {
  handlerIndex = 1;
}

asce41_handler = ASCE41_HANDlERS[handlerIndex];


compareResult = function (expected, actual) {
  expect(actual.sxs).to.be.closeTo(expected.sxs, epsilon);
  expect(actual.sx1).to.be.closeTo(expected.sx1, epsilon);
};

describe(asce41_handler.name +
  ` Quality Control Tests +/- ${epsilon}`, function () {
  let handler;

  this.timeout(100000);

  after(() => {
    handler.destroy();
    handler = null;
  });

  before(() => {
    handler = asce41_handler.handler(config);
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
        compareResult(city.response.data[0], standardResults.data[0]);
      });
      it('BSE-1N ' + JSON.stringify(city.response.data[1]), () => {
        compareResult(city.response.data[1], standardResults.data[1]);
      });
      it('BSE-2E ' + JSON.stringify(city.response.data[2]), () => {
        compareResult(city.response.data[2], standardResults.data[2]);
      });
      it('BSE-1E ' + JSON.stringify(city.response.data[3]), () => {
        compareResult(city.response.data[3], standardResults.data[3]);
      });
      it('Custom ' + JSON.stringify(city.response.data[4]), () => {
        compareResult(city.response.data[4], customResults.data[0]);
      });
    });
  });
});
