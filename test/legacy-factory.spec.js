/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    express = require('express'),
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

  describe('cacheRequest', () => {
    it('caches a request', () => {
      legacyFactory.cache = {};
      legacyFactory.cacheRequest('key', 'value');

      expect(legacyFactory.cache).to.not.equal({});
      expect(legacyFactory.cache).to.deep.equal({'key': 'value'});
    });
  });

  describe('cleanseInputs', () => {
    it('translates from the new inputs to the old inputs', () => {
      var newInputs,
          oldInputs,
          output;

      oldInputs = {
        design_code: 1,
        latitude: 40,
        longitude: -105,
        risk_category: 1,
        site_class: 7,
        title: 'title'
      };

      newInputs = {
        referenceDocument: '2015 NEHRP Provisions',
        latitude: 40,
        longitude: -105,
        riskCategory: 'I or II or III',
        siteClass: 'E',
        title: 'title'
      };

      output = legacyFactory.cleanseInputs(newInputs);

      expect(output).to.deep.equal(oldInputs);
    });
  });

  describe('getCachedRequest', () => {
    it('gets the cached request', () => {
      legacyFactory.cache = {'key': 'value'};

      expect(legacyFactory.getCachedRequest('key')).to.not.equal(null);
      expect(legacyFactory.getCachedRequest('key')).to.deep.equal('value');
    });
  });

  describe('getLegacyData', () => {
    it('returns the cached request', () => {
      sinon.stub(legacyFactory, 'cleanseInputs', () => { return {}; });
      sinon.stub(legacyFactory, 'getCachedRequest', () => { return 'test'; });
      legacyFactory.getLegacyData();

      expect(legacyFactory.getLegacyData()).to.equal('test');
    });

    it('calls all helper methods', (done) => {
      var cleanseStub,
          getCachedRequestStub,
          interpolateStub,
          response,
          result,
          requestStub,
          urlEncodeStub;

      response = {'data': 'test'};

      cleanseStub = sinon.stub(legacyFactory, 'cleanseInputs', () => {
        return {};
      });

      getCachedRequestStub = sinon.stub(legacyFactory, 'getCachedRequest', () => {
        return null;
      });

      interpolateStub = sinon.stub(legacyFactory, 'interpolate', () => {
        return {};
      });

      requestStub = sinon.stub(legacyFactory, 'makeRequest', () => {
        return new Promise((resolve) => {
          resolve(response);
        });
      });

      urlEncodeStub = sinon.stub(legacyFactory, 'urlEncode', () => {
        return '';
      });

      result = legacyFactory.getLegacyData();

      result.then(() => {
        expect(cleanseStub.callCount).to.equal(1);
        expect(getCachedRequestStub.callCount).to.equal(1);
        expect(urlEncodeStub.callCount).to.equal(1);
        expect(requestStub.callCount).to.equal(1);
        expect(interpolateStub.callCount).to.equal(1);
        expect(interpolateStub.calledWith(response)).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('getOptions', () => {
    it('creates an options object', () => {
      var inputs,
          options,
          stub;

      inputs = {
        'test': 'inputs'
      };

      legacyFactory.hostname = 'hostname';
      legacyFactory.port = 'port';
      legacyFactory.pathname = 'pathname';

      stub = sinon.stub(legacyFactory, 'urlEncode', () => { return ''; });
      options = legacyFactory.getOptions(inputs);

      expect(stub.callCount).to.equal(1);
      expect(stub.calledWith(inputs)).to.be.true;
      expect(options).to.deep.equal({
        'hostname': legacyFactory.hostname,
        'port': legacyFactory.port,
        'path': legacyFactory.pathname
      });
    });
  });

  describe('interpolate', () => {
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

  describe('interpolateResults', () => {
    it ('loops through object and calls interpolateValue', () => {
      var d0,
          d1,
          stub;

      d0 = d1 = {
        'one': 1,
        'two': 2,
        'three': 3
      };

      stub = sinon.stub(legacyFactory, 'interpolateValue', () => { return; });
      legacyFactory.interpolateResults(d0, d1, 0, 0, 0, 0);

      expect(stub.callCount).to.equal(3);
      expect(stub.getCall(0).args).to.deep.equal([1,1,0,0,0,0]);
      expect(stub.getCall(1).args).to.deep.equal([2,2,0,0,0,0]);
      expect(stub.getCall(2).args).to.deep.equal([3,3,0,0,0,0]);
    });
  });

  describe('interpolateValue', () => {
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
  });

  describe('interpolates correctly', () => {


  });

  describe('makeRequest', () => {
    it('returns the expected response', (done) => {
      var app,
          inputs,
          optionsStub,
          result,
          server;

      app = express();
      app.use('', express.static('etc'));
      server = app.listen(7999);

      inputs = {'key': 'value'};

      optionsStub = sinon.stub(legacyFactory, 'getOptions', () => {
        return {
          'hostname': 'localhost',
          'port': 7999,
          'path': '/makeRequest.json'
        };
      });

      result = legacyFactory.makeRequest(inputs);

      result.then((data) => {
        expect(optionsStub.callCount).to.equal(1);
        expect(data).to.deep.equal({'test':'working'});
      }).catch((err) => {
        return err;
      }).then((err) => {
        server.close();
        optionsStub.restore();
        done(err);
      });
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

      expect(params[0]).to.equal('');
      expect(params[1]).to.equal('0');
      expect(params[2]).to.equal('1');
      expect(params[3]).to.equal('2');
      expect(params[4]).to.equal('3');
      expect(params[5]).to.equal('4');
      expect(params[6]).to.equal('5');
    });
  });

});
