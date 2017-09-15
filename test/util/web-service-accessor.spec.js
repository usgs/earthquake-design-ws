/* global after, before, describe, it */
'use strict';


const expect = require('chai').expect,
    express = require('express'),
    sinon = require('sinon'),
    WebServiceAccessor = require('../../src/lib/util/web-service-accessor');


const _EXAMPLE_URL = 'https://example.com/some/path';


describe('util/web-service-accessor', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof WebServiceAccessor).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(WebServiceAccessor).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(()=>{WebServiceAccessor().destroy();}).to.not.throw(Error);
    });
  });

  describe('getData', () => {
    it('calls sub-methods and returns a promise', (done) => {
      let accessor,
          result;

      accessor = WebServiceAccessor();
      sinon.stub(accessor, 'getRequestOptions').callsFake(
          () => { return Promise.resolve(); });
      sinon.stub(accessor, 'request').callsFake(
          () => { return Promise.resolve(); });

      result = accessor.getData({});
      expect(result).to.be.instanceof(Promise);

      result.then(() => {
        expect(accessor.getRequestOptions.callCount).to.equal(1);
        expect(accessor.request.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          accessor.getRequestOptions.restore();
          accessor.request.restore();
          accessor.destroy();
        } catch (e) {
          err = err || e;
        }

        done(err);
      });
    });
  });

  describe('getHostname', () => {
    it('returns the hostname as expected', () => {
      let accessor;

      accessor = WebServiceAccessor({url: _EXAMPLE_URL});
      expect(accessor.getHostname()).to.equal('example.com');
      accessor.destroy();
    });
  });

  describe('getPath', () => {
    it('returns the path as expected', () => {
      let accessor;

      accessor = WebServiceAccessor({url: _EXAMPLE_URL});
      expect(accessor.getPath()).to.equal('/some/path');
      accessor.destroy();
    });
  });

  describe('getPort', () => {
    it('returns the port as expected', () => {
      let accessor;

      accessor = WebServiceAccessor({url: _EXAMPLE_URL});
      expect(accessor.getPort()).to.equal(443);
      accessor.destroy();
    });
  });

  describe('getQueryString', () => {
    it('returns a query string as expected', () => {
      let accessor;

      accessor = WebServiceAccessor();
      expect(accessor.getQueryString({param1: 'value1', param2: 'value2'}))
          .to.equal('?param1=value1&param2=value2');

      accessor.destroy();
    });
  });

  describe('getRequestOptions', () => {
    it('returns a promise with proper keys/values', (done) => {
      let accessor,
          promise;

      accessor = WebServiceAccessor();

      promise = accessor.getRequestOptions({});
      expect(promise).to.be.instanceof(Promise);

      promise.then((requestOptions) => {
        expect(requestOptions.hasOwnProperty('hostname')).to.be.true;
        expect(requestOptions.hasOwnProperty('path')).to.be.true;
        expect(requestOptions.hasOwnProperty('port')).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          accessor.destroy();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });

    });

    it('rejects on error', (done) => {
      let accessor;

      accessor = WebServiceAccessor();
      sinon.stub(accessor, 'getHostname').callsFake(
          () => { throw new Error('Example Error'); });

      accessor.getRequestOptions({}).then(() => {
        return new Error('Promise resolved when it should have rejected.');
      }).catch((/*err*/) => {
        // Ignore this, it is what was expected
      }).then((err) => {
        try {
          accessor.getHostname.restore();
          accessor.destroy();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('request', () => {
    let testApp,
        testPort,
        testServer;

    after(() => {
      testServer.close();
    });

    before((done) => {
      testApp = express();
      testApp.use('', express.static('etc'));
      testServer = testApp.listen(0, 'localhost', 1);
      testServer.once('listening', () => {
        testPort = testServer.address().port;
        done();
      });
    });

    it('properly fetches results', (done) => {
      let accessor,
          dataFile;

      accessor = WebServiceAccessor();
      dataFile = '/web-service-accessor-response.json';

      accessor.request({
        hostname: 'localhost',
        port: testPort,
        path: dataFile
      }).then((response) => {
        expect(response).to.deep.equal(require('../../etc' + dataFile));
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          accessor.destroy();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });
});