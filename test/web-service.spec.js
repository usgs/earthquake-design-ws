/* global afterEach, beforeEach, describe, it */
'use strict';


const expect = require('chai').expect,
    sinon = require('sinon'),
    WebService = require('../src/lib/web-service');


describe('WebService test suite', () => {
  describe('Constructor', () => {
    it('is defined', () => {
      expect(typeof WebService).to.equal('function');
    });

    it('creates/destroys a handler for each endpoint appropriately', () => {
      let constructor,
          handler,
          handlers,
          options;

      handler = {destroy: sinon.spy()};
      constructor = sinon.stub();
      constructor.returns(handler);

      handlers = {
        'endpoint': constructor
      };

      options = {
        handlers: handlers
      };

      WebService(options).destroy();

      expect(constructor.callCount).to.equal(1);
      expect(constructor.args[0][0].handlers).to.deep.equal(handlers);
      expect(handler.destroy.callCount).to.equal(1);
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        let obj;

        obj = WebService();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('get', function () {
    let service;

    beforeEach(function () {
      service = WebService();
    });

    afterEach(function () {
      service.destroy();
      service = null;
    });

    it('calls next when no handler for method', function () {
      let next,
          request;

      next = sinon.spy();
      request = {
        params: {
          method: 'no such method'
        }
      };

      service.get(request, null, next);
      expect(next.calledOnce).to.equal(true);
    });

    it('uses handler and calls its get method', function () {
      let handler,
          request;

      handler = {
        get: sinon.stub().returns({
          then: function () {
            return this;
          },
          catch: function () {
            return this;
          }
        }),
        destroy: function () {}
      };
      service.handlers['test handler'] = handler;
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      service.get(request, null, null);
      expect(handler.get.calledOnce).to.equal(true);
      expect(handler.get.calledWith(request.query)).to.equal(true);
    });

    it('calls onSuccess when handler promise resolves', function (done) {
      let args,
          data,
          handler,
          request;

      data = {};
      handler = {
        destroy: sinon.spy(),
        get: sinon.stub().returns(Promise.resolve(data))
      };
      service.handlers['test handler'] = handler;
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      sinon.stub(service, 'onSuccess').callsFake(() => {
        expect(service.onSuccess.calledOnce).to.equal(true);
        args = service.onSuccess.getCall(0).args;
        expect(args[0]).to.equal(data);
        expect(args[1]).to.equal(request);
        service.onSuccess.restore();
        done();
      });
      service.get(request);
    });

    it('calls onError when handler promise rejects', function (done) {
      let args,
          err,
          handler,
          request;

      err = new Error('test error');
      handler = {
        destroy: sinon.spy(),
        get: sinon.stub().returns(Promise.reject(err))
      };
      service.handlers['test handler'] = handler;
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      sinon.stub(service, 'onError').callsFake(() => {
        expect(service.onError.calledOnce).to.equal(true);
        args = service.onError.getCall(0).args;
        expect(args[0]).to.equal(err);
        expect(args[1]).to.equal(request);
        service.onError.restore();
        done();
      });
      service.get(request);
    });
  });

  describe('getRequestMetadata', function () {
    it('formats the metadata response', () => {
      let metadata,
          request,
          service;

      request = {
        headers: {
          host: 'hostname'
        },
        originalUrl: '/url?latitude=40&longitude=-105',
        protocol: 'protocol',
        query: {
          latitude: 40,
          longitude: -105,
        }
      };

      service = WebService();
      metadata = service.getRequestMetadata(request, true);

      expect(metadata.status).to.equal('success');
      expect(metadata.url).to.equal('protocol://hostname/url?latitude=40&longitude=-105');
      expect(metadata.parameters).to.deep.equal(request.query);
    });
  });

  describe('onError', function () {
    it('calls status/json callbacks with expected values', function () {
      let message,
          response,
          service,
          status;

      message = 'WebService::onError Test';
      status = 500;

      response = {
        json: sinon.spy(),
        status: sinon.spy()
      };

      service = WebService();

      service.onError({
        status: status,
        message: message
      }, null, response);

      expect(response.status.calledOnce).to.equal(true);
      expect(response.status.calledWith(status)).to.equal(true);
      expect(response.json.calledOnce).to.equal(true);
      expect(response.json.firstCall.args[0].response).to.equal(
          message);

      service.destroy();
    });
  });

  describe('onSuccess', function () {
    it('calls next when data is null', function () {
      let next,
          service;

      next = sinon.spy();
      service = WebService();

      service.onSuccess(null, null, null, next);
      expect(next.calledOnce).to.equal(true);

      service.destroy();
    });

    it('calls response.json with data', function () {
      let data,
          request,
          response,
          service,
          stub;

      data = {};
      request = {
        originalUrl: 'test url'
      };
      response = {
        json: sinon.spy()
      };
      service = WebService();
      stub = sinon.stub(service, 'getRequestMetadata').callsFake(
          () => { return ''; });

      service.onSuccess(data, request, response, null);
      expect(response.json.getCall(0).args[0].response).to.equal(data);
      expect(stub.getCall(0).args[0]).to.equal(request);

      service.destroy();
    });
  });

  describe('setHeaders', function () {
    it('sets headers on the response', function () {
      let response,
          service;

      response = {
        set: sinon.spy()
      };
      service = WebService();
      service.setHeaders(response);

      expect(response.set.callCount).to.equal(1);
      expect(typeof response.set.getCall(0).args[0]).to.equal('object');
    });
  });
});
