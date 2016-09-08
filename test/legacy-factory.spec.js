/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    LegacyFactory = require('../src/lib/legacy-factory'),
    sinon = require('sinon');

var EPSILION = 0.00001;

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

  describe('getLegacyData', () => {
    it('calls all helper methods', (done) => {
      var cleanseStub,
          interpolateStub,
          response,
          result,
          requestStub;

      response = {'data': 'test'};

      cleanseStub = sinon.stub(legacyFactory, 'cleanseInputs', () => {
        return {};
      });

      requestStub = sinon.stub(legacyFactory, 'makeRequest', () => {
        return new Promise((resolve) => {
          resolve(response);
        });
      });

      interpolateStub = sinon.stub(legacyFactory, 'interpolate', () => {
        return {};
      });

      result = legacyFactory.getLegacyData();

      result.then(function () {
        expect(cleanseStub.callCount).to.equal(1);
        expect(requestStub.callCount).to.equal(1);
        expect(interpolateStub.callCount).to.equal(1);
        expect(interpolateStub.calledWith(response)).to.be.true;
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  });

  describe('interpolates correctly', () => {

    it('interpolateValue is correct when interpolation_method is not linearlog', () => {
      expect(legacyFactory.interpolateValue(0, 2, 1/2, 0, 1)).to.equal(1);
    });

    it('interpolateValue is correct when interpolation_method is equal to linearlog', () => {
      expect(legacyFactory.interpolateValue(3, 2, 1/2, 0, 1, 'linearlog')).to.be.closeTo(
          2.4494897427, EPSILION);
    });

    it('interpolateValue throws error when a y value is 0', () => {
      var throwError;

      throwError = () => {
        legacyFactory.interpolateValue(0, 2, 1/2, 0, 1, 'linearlog');
      };

      expect(throwError).to.throw(Error);
    });

    it('interpolates one point correctly', () => {
      var data,
          interpolate;

      // Sample data, with results for a site near Los Angeles
      data = {
        'input': {
          'title': 'Los Angeles, CA',
          'latitude': 34,
          'longitude': -118,
          'design_code': 1,
          'risk_category': 1,
          'site_class': 4
        },
        'output': {
          'data': [
            {
              'latitude': 34,
              'longitude': -118,
              'mapped_ss': 1.91449,
              'mapped_s1': 0.571707,
              'mapped_pga': 0.819108,
              'crs': 0.89639,
              'cr1': 0.89975,
              'geomean_ssd': 1.2282925,
              'geomean_s1d': 0.4117471,
              'geomean_pgad': 0.5670918
            }
          ],
          'metadata': {
            'region_name': 'Conterminous US',
            'region_id': 6,
            'max_direction_ss': 1.1,
            'max_direction_s1': 1.3,
            'percentile_ss': 1.8,
            'percentile_s1': 1.8,
            'percentile_pga': 1.8,
            'deterministic_floor_ss': 1.5,
            'deterministic_floor_s1': 0.6,
            'deterministic_floor_pga': 0.5,
            'grid_spacing': 0.05
          },
          'tl': null
        }
      };

      interpolate = legacyFactory.interpolate(data);

      expect(JSON.stringify(interpolate)).to.equal(
          JSON.stringify({
            'latitude': 34,
            'longitude': -118,
            'mapped_ss': 1.91449,
            'mapped_s1': 0.571707,
            'mapped_pga': 0.819108,
            'crs': 0.89639,
            'cr1': 0.89975,
            'geomean_ssd': 1.2282925,
            'geomean_s1d': 0.4117471,
            'geomean_pgad': 0.5670918
          })
      );
    });

    it('interpolates two points correctly', () => {
      var calculateTwoPoints,
          interpolate;

      calculateTwoPoints = {
        'input': {
          'latitude': 34.4,
          'longitude': -180,
        },
        'output': {
          'metadata': {
            'interpolation_method': 'linearlog'
          },
          'data': [
            {
              'latitude': 34,
              'longitude': -180,
              'mapped_ss': 10
            },
            {
              'latitude': 35,
              'longitude': -180,
              'mapped_ss': 20
            }
          ]
        }
      };

      interpolate = legacyFactory.interpolate(calculateTwoPoints);

      expect(interpolate.latitude).to.be.closeTo(34.396524915060375,
          EPSILION);

      expect(interpolate.mapped_ss).to.be.closeTo(13.195079107728928,
          EPSILION);
    });

    it('interpolates four points correctly', () => {
      var calculateFourPoints,
          interpolate;

      calculateFourPoints = {
        'input': {
          'latitude': 34.4,
          'longitude': -174,
        },
        'output': {
          'metadata': {
            'interpolation_method': 'linearlog'
          },
          'data': [
            {
              'latitude': 34,
              'longitude': -180,
              'mapped_ss': 10
            },
            {
              'latitude': 34,
              'longitude': -170,
              'mapped_ss': 20
            },
            {
              'latitude': 35,
              'longitude': -180,
              'mapped_ss': 20
            },
            {
              'latitude': 35,
              'longitude': -170,
              'mapped_ss': 10
            }
          ]
        }
      };

      interpolate = legacyFactory.interpolate(calculateFourPoints);

      expect(interpolate.latitude).to.be.closeTo(34.396524915060375,
          EPSILION);

      expect(interpolate.mapped_ss).to.be.closeTo(14.339552480158279,
          EPSILION);
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
