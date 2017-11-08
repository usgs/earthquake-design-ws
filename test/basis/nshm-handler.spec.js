/* global afterEach, beforeEach, describe, it */
'use strict';


const NSHMHandler = require('../../src/lib/basis/nshm-handler'),
    expect = require('chai').expect,
    sinon = require('sinon');


const _FACTORY_RESULT = {
  'basicDesign': {
    'ss': null,
    's1': null,
    'pga': null,
    'ssuh': null,
    'ssrt': null,
    'ssd': null,
    's1uh': null,
    's1rt': null,
    's1d': null,
    'pgad': null
  },
  'deterministic': {},
  'finalDesign': {
    'sms': null,
    'sm1': null,
    'pgam': null,
    'sds': null,
    'sd1': null
  },
  'metadata': {
    'pgadPercentileFactor': null,
    'pgadFloor': null,

    's1MaxDirFactor': null,
    's1dPercentileFactor': null,
    's1dFloor': null,

    'ssMaxDirFactor': null,
    'ssdPercentileFactor': null,
    'ssdFloor': null
  },
  'probabilistic': {},
  'riskCoefficients': {
    'response': {
      'data': {}
    }
  },
  'siteAmplification': {
    'fa': null,
    'fa_note': null,
    'fv': null,
    'fv_note': null
  },
  'designCategory': {
    'sdcs': null,
    'sdc1': null,
    'sdc': null
  },
  'spectra': {
    'smSpectrum': [],
    'sdSpectrum': []
  }
};

const _HANDLER_RESULT = {
  'data': {
    'cr1': NaN,
    'crs': NaN,
    'fa': null,
    'fa_note': null,
    'fpga': NaN,
    'fv': null,
    'fv_note': null,
    'pga': null,
    'pgad': null,
    'pgam': null,
    'pgauh': NaN,
    's1': null,
    's1d': null,
    's1rt': null,
    's1uh': null,
    'sd1': null,
    'sdSpectrum': null,
    'sdc': null,
    'sdc1': null,
    'sdcs': null,
    'sds': null,
    'sm1': null,
    'smSpectrum': null,
    'sms': null,
    'ss': null,
    'ssd': null,
    'ssrt': null,
    'ssuh': null,
    't-sub-l': undefined,
    'cv': undefined,
    'savSpectrum': undefined,
    'samvSpectrum': undefined
  },
  'metadata': {
    'pgadFloor': null,
    'pgadPercentileFactor': null,
    's1MaxDirFactor': null,
    's1dFloor': null,
    's1dPercentileFactor': null,
    'ssMaxDirFactor': null,
    'ssdFloor': null,
    'ssdPercentileFactor': null
  }
};

const _DESIGN_FACTORY = {
  get: () => {
    return Promise.resolve(_FACTORY_RESULT);
  }
};


describe('asce7-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof NSHMHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      // Expect instantiation without a Factory in constructor to fail
      expect(NSHMHandler).to.throw(Error);

      // Expect instantiation with a Factory in constructor to not fail
      expect(() => {
        NSHMHandler({factory: {}}).destroy();
      }).to.not.throw(Error);

      // Expect instantiation with a factoryConstructor in constructor to not fail
      expect(() => {
        NSHMHandler({factoryConstructor: () => {}});
      }).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      const handler = NSHMHandler({factory: {}});

      expect(handler.destroy).to.not.throw(Error);
    });

    it('sets the referenceDocument and instantiates the factory', () => {
      let factory,
          handler,
          referenceDocument;

      factory = sinon.spy();
      referenceDocument = 'ASCE7-16';
      handler = NSHMHandler({
        factoryConstructor: factory,
        referenceDocument: referenceDocument
      });

      expect(handler.referenceDocument).to.equal(referenceDocument);
      expect(factory.called).to.be.true;
    });
  });

  describe('checkParams', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = NSHMHandler({factory: _DESIGN_FACTORY});
    });

    it('returns error if parameters are missing', (done) => {
      handler.checkParams({}).then(() => {
        return new Error('checkParams passed');
      }).catch((err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.status).to.equal(400);
      }).then(done);
    });
  });

  describe('formatResult', () => {
    it('returns a promise', () => {
      let handler;

      handler = NSHMHandler({factory: _DESIGN_FACTORY});

      expect(handler.formatResult()).to.be.instanceof(Promise);

      handler.destroy();
    });

    it('resolves with expected data structure', (done) => {
      let handler;

      handler = NSHMHandler({factory: _DESIGN_FACTORY});

      handler.formatResult(_FACTORY_RESULT).then((formatted) => {
        [
          'ssuh', 's1uh',
          'ssrt', 's1rt',
          'ssd', 's1d', 'pgad',
          'ss', 's1', 'pga',
          'sms', 'sm1', 'pgam',
          'fa', 'fa_note', 'fv', 'fv_note',
          'sds', 'sdcs', 'sd1', 'sdc1', 'sdc',
          'smSpectrum', 'sdSpectrum'
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });
        [
          'pgadPercentileFactor', 'pgadFloor',
          's1MaxDirFactor', 's1dPercentileFactor', 's1dFloor',
          'ssMaxDirFactor', 'ssdPercentileFactor', 'ssdFloor'
        ].forEach((key) => {
          expect(formatted.metadata.hasOwnProperty(key)).to.equal(true);
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        handler.destroy();
        done(err);
      });
    });
  });

  describe('get', () => {
    let handler;

    afterEach(() => {
      handler.destroy();
    });

    beforeEach(() => {
      handler = NSHMHandler({factory: _DESIGN_FACTORY});
    });

    it('calls checkParams method', () => {
      sinon.stub(handler, 'checkParams').callsFake(() => {
        return Promise.resolve({});
      });

      handler.get();

      expect(handler.checkParams.callCount).to.equal(1);

      handler.checkParams.restore();
    });

    it('returns a promise', () => {
      let result;

      result = handler.get({});

      expect(result).to.be.an.instanceof(Promise);
    });

    it('returns an object with data', (done) => {
      sinon.stub(handler, 'checkParams').callsFake(() => {
        return Promise.resolve({});
      });

      handler.get({}).then((params) => {
        expect(params).to.deep.equal(_HANDLER_RESULT);
      }).catch((err) => {
        return err;
      }).then(done);

      handler.checkParams.restore();
    });
  });
});
