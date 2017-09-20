/* global after, before, describe, it */
'use strict';


const ASCE7_10Handler = require('../../src/lib/asce7_10-handler'),
    ASCE7_16Handler = require('../../src/lib/asce7_16-handler'),
    ASCE7_05Handler = require('../../src/lib/asce7_05-handler'),
    ASCE7_10CityInputs = require('../../etc/asce7_10-qc.json'),
    ASCE7_16CityInputs = require('../../etc/asce7_16-qc.json'),
    ASCE7_05CityInputs = require('../../etc/asce7_05-qc.json'),
    Config = require('../../src/lib/util/config'),
    expect = require('chai').expect;

const ASCE7_HANDlERS = [
  {
    handler: ASCE7_10Handler,
    name: 'ASCE 7-10',
    data: ASCE7_10CityInputs
  },
  {
    handler: ASCE7_16Handler,
    name: 'ASCE 7-16',
    data: ASCE7_16CityInputs
  },
  {
    handler: ASCE7_05Handler,
    name: 'ASCE 7-05',
    data: ASCE7_05CityInputs
  }
];

let config,
    compareResult,
    handlerSwitch,
    handlerIndex,
    asce7_handler;

config = Config().get();

const epsilon = config.epsilon || 1E-4;

/**
 * The index of the handler is passed in from the CLI from the
 * update-quality-control.sh script.  This is so distinct
 * quality control reports for each handler can be generated.
 */
handlerSwitch = (process.argv[5] === undefined) ? '--asce7-10' : process.argv[5];

if (handlerSwitch === '--asce7-10') {
  handlerIndex = 0;
} else if (handlerSwitch === '--asce7-16') {
  handlerIndex = 1;
} else {
  handlerIndex = 2;
}

asce7_handler = ASCE7_HANDlERS[handlerIndex];


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

  if (expected.hasOwnProperty('t-sub-l')) {
    if (expected['t-sub-l'] === null) {
      expect(actual['t-sub-l']).to.equal(null);
    } else {
      expect(actual['t-sub-l']).to.be.closeTo(expected['t-sub-l'], epsilon);
    }
  }
};

describe(asce7_handler.name + ` Quality Control Tests +/- ${epsilon}`, () => {
  let handler;

  before(() => {
    handler = asce7_handler.handler(config);
  });

  after(() => {
    handler.destroy();
    handler = null;
  });

  asce7_handler.data.forEach((city) => {
    let label,
        latitude,
        longitude,
        riskCategory,
        title;

    label = city.request.parameters.label;
    latitude = city.request.parameters.latitude;
    longitude = city.request.parameters.longitude;
    riskCategory = 'I';
    title = 'QC_Test-' + asce7_handler.name + '-Handler';
    label = `${label} (${latitude}, ${longitude})`;

    describe(label, () => {
      let cityResponse,
          i,
          len,
          siteClass;

      len = city.response.data.length;
      for (i = 0; i < len; i++) {
        cityResponse = city.response.data[i];
        siteClass = cityResponse.siteClass;


        it(JSON.stringify(cityResponse), (done) => {
          let request;

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

