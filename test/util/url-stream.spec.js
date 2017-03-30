/* global after, before, describe, it */


var expect = require('chai').expect,
    express = require('express'),
    UrlStream = require('../../src/lib/util/url-stream');



describe('util/url-stream', function () {
  var testApp,
      testPort,
      testServer;

  after(() => {
    testServer.close();
  });

  before((done) => {
    testPort = 7999;
    testApp = express();
    testApp.use('', express.static('etc'));

    testServer = testApp.listen(testPort, () => { done(); });
  });


  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof UrlStream).to.equal('function');
    });
  });

  describe('destroy', () => {
    it('can be destroyed repeatedly', () => {
      expect(() => {
        var stream;
        stream = UrlStream();
        stream.destroy();
        stream.destroy();
      });
    });
  });

  describe('readPromise', () => {

    it('returns the expected response', (done) => {
      UrlStream({
        url: 'http://localhost:' + testPort + '/makeRequest.json'
      }).readPromise().then((data) => {
        data = JSON.parse(data);
        expect(data).to.deep.equal({'test': 'working'});
        done();
      }).catch((err) => {
        done(err);
      });
    });

  });

});
