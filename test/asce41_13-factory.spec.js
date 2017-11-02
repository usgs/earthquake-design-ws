/* global describe, it */
'use strict';

const ASCE41_13Factory = require('../src/lib/asce41_13-factory'),
    expect = require('chai').expect,
    sinon = require('sinon');

const _DUMMY_FACTORY = {
  metadataService: {
    getData: () => { return Promise.resolve({response: { data:[] } }); }
  },
  tsublService: {
    getData: () => { return Promise.resolve({response: { data: {}}}); }
  },
  spectraFactory: {
    getHorizontalSpectrum: () => { return Promise.resolve([]); }
  },
  probabilisticService: {
    getData: () => { return Promise.resolve({response: { data:[] } }); }
  },
  deterministicService: {
    getData: () => { return Promise.resolve({response: { data:[] } }); }
  },
  riskCoefficientService: {
    getData: () => { return Promise.resolve({response: { data:[] } }); }
  },
  siteAmplificationService: {
    getData: () => {
      return Promise.resolve({response: { data:[{ fa: 0, fv: 0 }] }});
    }
  },
  uhtHazardCurveFactory: {
    getDesignCurves: () => {
      const points = [];
      points.push({
        latitude: 1,
        longitude: 1,
        value: 0.5
      });
      return { SA0P2: points, SA1P0: [0,0] };
    }
  },
  targetGroundMotion: {
    getTargetedGroundMotion: () => {
      return [];
    }
  }
};

describe('asce41_13-factory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof ASCE41_13Factory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(ASCE41_13Factory).to.not.throw(Error);
    });

    it('can be destroyed', () => {

      const factory = ASCE41_13Factory();

      expect(factory.destroy).to.not.throw(Error);
    });
  });

  describe('computeBse1E', () => {
    it('should return a valid Bse1E value', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);

      sinon.stub(factory, 'getCustomProbabilityDesignData').callsFake(
          () => { return Promise.resolve({data: [{ ss: 0, s1: 0, fa: 0, fv: 0 }]}); });

      sinon.stub(factory.spectraFactory, 'getHorizontalSpectrum').callsFake(
          () => { return Promise.resolve([0,0]); });

      factory.computeBse1E({}, {}, 0).then((result) => {
        expect(factory.getCustomProbabilityDesignData.callCount).to.equal(1);
        expect(factory.spectraFactory.getHorizontalSpectrum.callCount).to.equal(1);
        expect(result).to.have.property('hazardLevel');
        expect(result).to.have.property('ss');
        expect(result).to.have.property('fa');
        expect(result).to.have.property('sxs');
        expect(result).to.have.property('s1');
        expect(result).to.have.property('fv');
        expect(result).to.have.property('sx1');
        expect(result).to.have.property('horizontalSpectrum');
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('computeBse2E', () => {
    it('should return a valid Bse2E value', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);

      sinon.stub(factory, 'getCustomProbabilityDesignData').callsFake(
          () => { return Promise.resolve({data: [{ ss: 0, s1: 0, fa: 0, fv: 0 }]}); });

      sinon.stub(factory.spectraFactory, 'getHorizontalSpectrum').callsFake(
          () => { return Promise.resolve([0,0]); });

      factory.computeBse2E({}, {}, 0).then((result) => {
        expect(factory.getCustomProbabilityDesignData.callCount).to.equal(1);
        expect(factory.spectraFactory.getHorizontalSpectrum.callCount).to.equal(1);
        expect(result).to.have.property('hazardLevel');
        expect(result).to.have.property('ss');
        expect(result).to.have.property('fa');
        expect(result).to.have.property('sxs');
        expect(result).to.have.property('s1');
        expect(result).to.have.property('fv');
        expect(result).to.have.property('sx1');
        expect(result).to.have.property('horizontalSpectrum');
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('computeBse1N', () => {
    it('should return a valid Bse1N value', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);
      const result = factory.computeBse1N({sxs: 0, sx1: 0, horizontalSpectrum: [0,0]});

      expect(result).to.be.instanceof(Promise);
      result.then((result) => {
        expect(result).to.have.property('hazardLevel');
        expect(result).to.have.property('sxs');
        expect(result).to.have.property('sx1');
        expect(result).to.have.property('horizontalSpectrum');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('computeBse2N', () => {
    it('should return a valid Bse2N value', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);
      const result = factory.computeBse2N({},{});

      expect(result).to.be.instanceof(Promise);
      result.then((result) => {
        expect(result).to.have.property('hazardLevel');
        expect(result).to.have.property('sxs');
        expect(result).to.have.property('sx1');
        expect(result).to.have.property('horizontalSpectrum');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('get', () => {
    it('delegates to proper method', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);

      sinon.stub(factory, 'getCustomProbabilityDesignData').callsFake(
          () => { return Promise.resolve({data: []}); });
      sinon.stub(factory, 'getStandardDesignData').callsFake(
          () => { return Promise.resolve({data: []}); });

      Promise.all([
        factory.get({customProbability: 0.1}),
        factory.get({})
      ]).then(() => {
        expect(factory.getCustomProbabilityDesignData.callCount).to.equal(1);
        expect(factory.getStandardDesignData.callCount).to.equal(1);

        factory.getCustomProbabilityDesignData.restore();
        factory.getStandardDesignData.restore();
      }).catch((err) => {
        return err;
      }).then(done);
    });
  });

  describe('getCustomProbabilityDesignData', () => {
    it('should return valid Custom Design Data', (done) => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);
      const result = factory.getCustomProbabilityDesignData({latitude:1 ,longitude:1});

      expect(result).to.be.instanceof(Promise);

      result.then((result) => {
        expect(result.data[0]).to.have.property('hazardLevel');
        expect(result.data[0]).to.have.property('customProbability');
        expect(result.data[0]).to.have.property('ss');
        expect(result.data[0]).to.have.property('fa');
        expect(result.data[0]).to.have.property('sxs');
        expect(result.data[0]).to.have.property('s1');
        expect(result.data[0]).to.have.property('fv');
        expect(result.data[0]).to.have.property('sx1');
        expect(result.data[0]).to.have.property('horizontalSpectrum');
      }).catch((err) => {
        return err;
      }).then((err) => {
        done(err);
      });
    });
  });

  describe('getStandardDesignData', () => {
    it('should call computeBse1E, computeBse2E, computeBse1N and computeBse2N', () => {

      const factory = ASCE41_13Factory(_DUMMY_FACTORY);

      sinon.stub(factory, 'computeBse1E').callsFake(
          () => { return Promise.resolve({}); });
      sinon.stub(factory, 'computeBse2E').callsFake(
          () => { return Promise.resolve({}); });
      sinon.stub(factory, 'computeBse1N').callsFake(
          () => { return Promise.resolve({}); });
      sinon.stub(factory, 'computeBse2N').callsFake(
          () => { return Promise.resolve({}); });

      const result = factory.getStandardDesignData({});

      result.then(() => {
        expect(factory.computeBse1E.callCount).to.equal(1);
        expect(factory.computeBse2E.callCount).to.equal(1);
        expect(factory.computeBse1N.callCount).to.equal(1);
        expect(factory.computeBse2N.callCount).to.equal(1);
      }).catch((err) => {
        return err;
      });
    });
  });
});
