/* global describe, it */
'use strict';

const DesignHandler = require('../../src/lib/asce/aashto_2009-handler'),
    expect = require('chai').expect;


describe('aashto_2009-handler', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof DesignHandler).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(DesignHandler).to.not.throw(Error);
    });
  });

  describe('formatResult', () => {
    it('returns a promise', () => {
      let handler;

      handler = DesignHandler();

      expect(handler.formatResult()).to.be.instanceof(Promise);

      handler.destroy();
    });

    it('resolves with expected data structure', (done) => {
      let handler;

      handler = DesignHandler();
      handler.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga':null
        },
        'siteAmplification': {
          'fpga': null,
          'fa': null,
          'fv': null
        },
        'designPGA': {
          'as': null
        },
        'finalDesign': {
          'sms': null,
          'sm1': null,
          'sds': null,
          'sd1': null,
          'ts': null,
          't0': null
        },
        'designCategory': {
          'sdcs': null,
          'sdc1': null,
          'sdc': null
        },
        'spectra': {
          'sdSpectrum': []
        },
        'metadata': {
          'response': {
            'data': {
              'spatialInterpolationMethod': null
            }
          }
        },
        'probabilistic': {
          'response': {
            'metadata': {
              'regionName': null
            }
          }
        }
      }).then((formatted) => {
        [
          'pga', 'fpga', 'as',
          'ss', 'fa', 'sds', 's1',
          'fv','sd1','sdc',
          'ts', 't0',
          'sdSpectrum' 
        ].forEach((key) => {
          expect(formatted.data.hasOwnProperty(key)).to.equal(true);
        });
        [
          'griddedValuesID',
          'spatialInterpolationMethod'
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

    it('resolves with expected undefined sdSpectrum data structure', (done) => {
      let handler;

      handler = DesignHandler();
      handler.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga':null
        },
        'siteAmplification': {
          'fpga': null,
          'fa': null,
          'fv': null
        },
        'designPGA': {
          'as': null
        },
        'finalDesign': {
          'sms': null,
          'sm1': null,
          'sds': null,
          'sd1': null,
          'ts': null,
          't0': null
        },
        'designCategory': {
          'sdcs': null,
          'sdc1': null,
          'sdc': null
        },
        'spectra': {
          'sdSpectrum': []
        },
        'metadata': {
          'response': {
            'data': {
              'spatialInterpolationMethod': null
            }
          }
        },
        'probabilistic': {
          'response': {
            'metadata': {
              'regionName': null
            }
          }
        }
      }).then((formatted) => {
        expect(formatted['sdSpectrum']).to.be.undefined;
      }).catch((err) => {
        return err;
      }).then((err) => {
        handler.destroy();
        done(err);
      });
    });

    it('resolves with expected defined sdSpectrum data structure', (done) => {
      let handler;

      handler = DesignHandler();
      handler.formatResult({
        'basicDesign': {
          'ss': null,
          's1': null,
          'pga':null
        },
        'siteAmplification': {
          'fpga': null,
          'fa': 1,
          'fv': 1.3
        },
        'designPGA': {
          'as': null
        },
        'finalDesign': {
          'sms': null,
          'sm1': null,
          'sds': null,
          'sd1': null,
          'ts': null,
          't0': null
        },
        'designCategory': {
          'sdcs': null,
          'sdc1': null,
          'sdc': null
        },
        'spectra': {
          'sdSpectrum': []
        },
        'metadata': {
          'response': {
            'data': {
              'spatialInterpolationMethod': null
            }
          }
        },
        'probabilistic': {
          'response': {
            'metadata': {
              'regionName': null
            }
          }
        }
      }).then((formatted) => {
        expect(formatted['sdSpectrum']).to.be.defined;
      }).catch((err) => {
        return err;
      }).then((err) => {
        handler.destroy();
        done(err);
      });
    });
  });
});

