/* global afterEach, beforeEach, describe, it */
'use strict';

const TSubLDataHandler = require('../src/lib/t-sub-l-data-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _INPUT = {
  latitude: 0,
  longitude: 0,
  referenceDocument: 'EXAMPLE_DOCUMENT'
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
  'data': {
    'id': 0,
    'region_id': 0,

    'latitude': 0,
    'longitude': 0,
    'value': 1
  },
  'metadata': {
    'region': {
      'id': 0,

      'name': 'EXAMPLE_REGION'
    },
    'document': {
      'id': 0,

      'region_id': 0,
      'name': 'EXAMPLE_DOCUMENT'
    }
  }
};


describe('t-sub-l-data-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof TSubLDataHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(TSubLDataHandler).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var handler;

      handler = TSubLDataHandler();
      expect(handler.destroy).to.not.throw(Error);
    });
  });

  describe('checkParams', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = TSubLDataHandler({factory: _FACTORY});
    });

    it('returns error if parameters are missing', (done) => {
      handler.checkParams({}).then(() => {
        return new Error('checkParams passed erroneously');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.status).to.equal(400);
      }).then(done);
    });
  });

  describe('createDbPool', () => {
    it('sets _this.db to a Pool', () => {
      let handler;

      handler = TSubLDataHandler({factory: _FACTORY});

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
      handler = TSubLDataHandler({factory: _FACTORY});
    });


    it('resolves with object with appropriate structure', (done) => {
      let formatted;

      formatted = handler.formatResult(_RESULT);
      expect(formatted).to.be.instanceof(Promise);

      formatted.then((result) => {
        let data,
            metadata;

        expect(result.hasOwnProperty('data')).to.be.true;
        expect(result.hasOwnProperty('metadata')).to.be.true;

        data = result.data;
        metadata = result.metadata;

        expect(data.hasOwnProperty('value')).to.be.true;
        expect(metadata.hasOwnProperty('regionName')).to.be.true;
      }).catch((err) => {
        return err;
      }).then(done);
    });

    it('rejects if input object is invalid', (done) => {
      handler.formatResult({}).then(() => {
        done(new Error('Result was invalid and should have rejected, ' +
            'but instead resolved.'));
      }).catch((/*err*/) => {
        done();
      });
    });
  });

  describe('get', () => {
    it('checks params and defers to factory', (done) => {
      let handler,
          spy,
          stub;

      handler = TSubLDataHandler({factory: _FACTORY});

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
