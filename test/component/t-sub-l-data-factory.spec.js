/* global afterEach, beforeEach, describe, it */
'use strict';


const TSubLDataFactory = require('../../src/lib/component/t-sub-l-data-factory'),
    expect = require('chai').expect,
    sinon = require('sinon');


describe('t-sub-l-data-factory', () => {
  let factory;


  afterEach(() => {
    factory.destroy();
    factory = null;
  });

  beforeEach(() => {
    factory = TSubLDataFactory();
  });


  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof TSubLDataFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(TSubLDataFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => { TSubLDataFactory().destroy(); }).to.not.throw(Error);
    });
  });

  describe('get', () => {
    it('returns a promise and calls functions as intended', (done) => {
      let result;

      sinon.stub(factory, 'getMetadata').callsFake(() => Promise.resolve({}));
      sinon.stub(factory, 'getData').callsFake(() => Promise.resolve({}));

      result = factory.get({
        latitude: 0,
        longitude: 1
      });

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.getData.callCount).to.equal(1);
        expect(factory.getMetadata.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getData.restore();
          factory.getMetadata.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getData', () => {
    it('returns a promise and queries the database', (done) => {
      let inputs,
          metadata,
          result;

      inputs = {
        latitude: 0,
        longitude: 0
      };

      metadata = {
        region: {
          id: 0
        }
      };

      sinon.spy(factory.db, 'query');
      result = factory.getData(metadata, inputs);

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryData, [0, 0, 0])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getDocument', () => {
    it('returns a promise and queries the database', (done) => {
      let result;

      sinon.spy(factory.db, 'query');
      result = factory.getDocument({referenceDocument: 'foo'}, {id: 1});

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryDocument, [1, 'foo'])).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getMetadata', () => {
    it('returns a promise and calls correct sub-methods', (done) => {
      let inputs,
          result;

      inputs = {
        latitude: 0,
        longitude: 0,
        referenceDocument: 'foo'
      };

      sinon.spy(factory, 'getRegion');
      sinon.stub(factory, 'getDocument').callsFake(() => Promise.resolve({}));
      result = factory.getMetadata(inputs);

      expect(result).to.be.instanceof(Promise);
      result.then((metadata) => {
        expect(metadata.hasOwnProperty('region')).to.be.true;
        expect(metadata.hasOwnProperty('document')).to.be.true;

        expect(factory.getRegion.callCount).to.equal(1);
        expect(factory.getDocument.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.getRegion.restore();
          factory.getDocument.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });

  describe('getRegion', () => {
    it('returns a promise and queries the database', (done) => {
      let result;

      sinon.spy(factory.db, 'query');
      result = factory.getRegion({latitude: 0, longitude: 1});

      expect(result).to.be.instanceof(Promise);
      result.then(() => {
        expect(factory.db.query.callCount).to.equal(1);
        expect(factory.db.query.calledWith(factory.queryRegion, null)).to.be.true;
      }).catch((err) => {
        return err;
      }).then((err) => {
        try {
          factory.db.query.restore();
        } catch (e) {
          err = err || e;
        }
        done(err);
      });
    });
  });
});