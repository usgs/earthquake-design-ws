/* global after, afterEach, before, beforeEach, describe, it */
'use strict';


var DesignHazardMetadata = require('../../src/lib/util/design-hazard-metadata'),
    expect = require('chai').expect;


describe('util/design-hazard-metadata', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHazardMetadata).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHazardMetadata).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      var metadata;

      metadata = DesignHazardMetadata();

      expect(metadata.destroy).to.not.throw(Error);
    });
  });

  describe('contains', () => {
    var metadata;

    afterEach(() => {
      metadata.destroy();
    });

    beforeEach(() => {
      metadata = DesignHazardMetadata();
    });


    it('returns truthy when expected', () => {
      expect(metadata.contains({
        maxLatitude: 1,
        maxLongitude: 1,
        minLatitude: 0,
        minLongitude: 0
      }, 0.5, 0.5)).to.equal(true);
    });

    it('returns falsey when expected', () => {
      expect(metadata.contains({
        maxLatitude: 1,
        maxLongitude: 1,
        minLatitude: 0,
        minLongitude: 0
      }, 2, 2)).to.equal(false);
    });
  });

  describe('getHazardMetadata', () => {
    var metadata,
        region;

    after(() => {
      metadata.destroy();

      metadata = null;
      region = null;
    });

    before(() => {
      region = {
        'hazardEdition': 'testHazardEdition',
        'hazardRegion': 'testHazardRegion',
        'minLatitude': 0,
        'maxLatitude': 1,
        'minLongitude': 0,
        'maxLongitude': 1,
        'gridSpacing': 0.01
      };

      metadata = DesignHazardMetadata({map: {'testDesignEdition': [region]}});
    });


    it('returns a promise', () => {
      expect(metadata.getHazardMetadata()).to.be.an.instanceof(Promise);
    });

    it('rejects with an error when called incorrectly', (done) => {
      metadata.getHazardMetadata().then(() => {
        done('Promise resolved when it should have rejected!');
      }).catch((/*err*/) => {
        done();
      });
    });

    it('rejects with an error when no mapping found', (done) => {
      metadata.getHazardMetadata({
        designEdition: 'testDesignEdition',
        latitude: 1.5,
        longitude: 1.5
      }).then((/*result*/) => {
        done('Promise resolved when it should have rejected!');
      }).catch((/*err*/) => {
        done();
      });
    });

    it('resolves with a region when found', (done) => {
      metadata.getHazardMetadata({
        designEdition: 'testDesignEdition',
        latitude: 0.5,
        longitude: 0.5
      }).then((result) => {
        expect(result).to.deep.equal(region);
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });
});
