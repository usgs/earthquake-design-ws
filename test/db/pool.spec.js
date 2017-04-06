/* global afterEach, beforeEach, describe, it */
'use strict';


var expect = require('chai').expect,
    Pool = require('../../src/lib/db/pool'),
    sinon = require('sinon');


var _MOCK_DB_CLIENT,
    _MOCK_DB_POOL;

_MOCK_DB_CLIENT = {
  query: sinon.spy(() => {
    return Promise.resolve({rows: []});
  })
};

_MOCK_DB_POOL = {
  connect: sinon.spy(() => {
    return Promise.resolve(_MOCK_DB_CLIENT);
  })
};


describe('db/pool', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof Pool).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(() => {Pool({pool: null});}).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var pool;

        pool = Pool({pool: null});
        pool.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('query', () => {
    var pool;

    afterEach((done) => {
      pool.destroy().then(done);
    });

    beforeEach(() => {
      var key;

      pool = Pool({pool: _MOCK_DB_POOL});

      for (key in _MOCK_DB_POOL) {
        _MOCK_DB_POOL[key].reset();
      }

      for (key in _MOCK_DB_CLIENT) {
        _MOCK_DB_CLIENT[key].reset();
      }
    });

    it('returns a promise', () => {
      expect(pool.query()).to.be.instanceof(Promise);
    });

    it('calls connect on underlying to pool', () => {
      pool.query().then(() => {
        expect(_MOCK_DB_POOL.connect.callCount).to.equal(1);
      });
    });

    it('calls query method as on underlying client as expected', () => {
      var sql;

      sql = 'Example Query';

      pool.query().then(() => {
        expect(_MOCK_DB_CLIENT.query.callCount).to.equal(2);
        expect(_MOCK_DB_CLIENT.query.calledWith(pool.setSearchPathQuery))
            .to.be.true;
        expect(_MOCK_DB_CLIENT.query.calledWith(sql)).to.be.true;
      });
    });
  });
});
