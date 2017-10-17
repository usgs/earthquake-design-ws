/* global afterEach, beforeEach, describe, it */
'use strict';

const SiteAmplificationHandler = require('../src/lib/site-amplification-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _INPUT = {
  referenceDocument: 'EXAMPLE_DOCUMENT',
  siteClass: 'A',
  ss: 1,
  s1: 2
};

const _FACTORY = {
  destroy: () => {
    // Nothing to do here
  },
  get: () => {
    return Promise.resolve(_RESULT);
  }
};

const _RESULT = {
  'fa': 0,
  'fa_note': 'note',
  'fv': 0,
  'fv_note': 'note',
  'fpga': 1,
  'fpga_note': 'note'
};


describe('gridded-data-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof SiteAmplificationHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(SiteAmplificationHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const handler = SiteAmplificationHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = SiteAmplificationHandler({factory: _FACTORY});
    });

    it('returns error if parameters are missing', (done) => {
      handler.checkParams({}).then(() => {
        return new Error('checkParams passed erroneously');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.status).to.equal(400);
      }).then(done);
    });

    it('passes when all required values are provided', (done) => {
      handler.checkParams(_INPUT).then((params) => {
        expect(params).to.deep.equal(_INPUT);
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('createDbPool', () => {
    it('sets _this.db to a Pool', () => {
      let handler;

      handler = SiteAmplificationHandler({factory: _FACTORY});

      expect(handler.db).to.be.undefined;
      handler.createDbPool();

      // Do a duck-type check on the db
      expect(typeof handler.db.destroy).to.equal('function');
      expect(typeof handler.db.query).to.equal('function');

      handler.destroy();
      handler = null;
    });
  });

  describe('formatResult', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
      handler = null;
    });

    beforeEach(() => {
      handler = SiteAmplificationHandler({factory: _FACTORY});
    });


    it('resolves with object with appropriate structure', (done) => {
      var formatted;

      formatted = handler.formatResult(_RESULT);
      expect(formatted).to.be.instanceof(Promise);

      formatted.then((result) => {
        var data;

        expect(result.hasOwnProperty('data')).to.be.true;
        expect(result.hasOwnProperty('metadata')).to.be.true;

        data = result.data;

        expect(data.hasOwnProperty('fa')).to.be.true;
        expect(data.hasOwnProperty('fa_note')).to.be.true;
        expect(data.hasOwnProperty('fv')).to.be.true;
        expect(data.hasOwnProperty('fv_note')).to.be.true;
        expect(data.hasOwnProperty('fpga')).to.be.true;
        expect(data.hasOwnProperty('fpga_note')).to.be.true;
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('get', () => {
    it('checks params and defers to factory', (done) => {
      let handler,
          spy,
          stub;

      handler = SiteAmplificationHandler({factory: _FACTORY});

      stub = sinon.stub(handler, 'checkParams').callsFake(() => {
        return Promise.resolve(_INPUT);
      });
      spy = sinon.spy(handler.factory, 'get');

      handler.get(_INPUT).then(() => {
        expect(stub.callCount).to.equal(1);
        expect(spy.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        stub.restore();
        spy.restore();
        handler.destroy();
        handler = null;
        done(err);
      });

      handler.checkParams.restore();
    });
  });
});
