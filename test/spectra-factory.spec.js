/* global describe, it */
'use strict';


var expect = require('chai').expect,
    SpectraFactory = require('../src/lib/spectra-factory');


describe('SpectraFactory', () => {
  describe('constructor', () => {
    it('is defined', () => {
      expect(typeof SpectraFactory).to.equal('function');
    });

    it('can be instantiated', () => {
      expect(SpectraFactory).to.not.throw(Error);
    });

    it('can be destroyed', () => {
      expect(() => {
        var factory;

        factory = SpectraFactory();
        factory.destroy();
        factory = null;
      }).to.not.throw(Error);
    });
  });

  describe('getSpectrum', () => {
    it('returns a promise', () => {
      var factory;

      factory = SpectraFactory();

      expect(factory.getSpectrum(1.0, 0.5)).to.be.instanceof(Promise);

      factory.destroy();
    });

    it('resolves with an XY_Series data structure', (done) => {
      var factory;

      factory = SpectraFactory();

      factory.getSpectrum(1.0, 0.5).then((result) => {
        expect(result).to.be.instanceof(Array);

        result.forEach((entry) => {
          expect(entry).to.be.instanceof(Array);
          expect(entry.length).to.equal(2);
          expect(isNaN(entry[0])).to.equal(false);
          expect(isNaN(entry[1])).to.equal(false);
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        factory = null;
        done(err);
      });
    });

    it('properly compute a spectra', (done) => {
      var factory;

      factory = SpectraFactory();

      factory.getSpectrum(1.5384, 0.8248).then((result) => {
        var expectation;

        expectation = [
          [0.00, 0.6154],
          [0.11, 1.5384],
          [0.54, 1.5384],
          [0.55, 1.4996],
          [0.60, 1.3747],
          [0.65, 1.2689],
          [0.70, 1.1783],
          [0.75, 1.0997],
          [0.80, 1.0310],
          [0.85, 0.9704],
          [0.90, 0.9164],
          [0.95, 0.8682],
          [1.00, 0.8248],
          [1.05, 0.7855],
          [1.10, 0.7498],
          [1.15, 0.7172],
          [1.20, 0.6873],
          [1.25, 0.6598],
          [1.30, 0.6345],
          [1.35, 0.6110],
          [1.40, 0.5891],
          [1.45, 0.5688],
          [1.50, 0.5499],
          [1.55, 0.5321],
          [1.60, 0.5155],
          [1.65, 0.4999],
          [1.70, 0.4852],
          [1.75, 0.4713],
          [1.80, 0.4582],
          [1.85, 0.4458],
          [1.90, 0.4341],
          [1.95, 0.4230],
          [2.00, 0.4124]
        ];

        expectation.forEach((expected, index) => {
          var actual,
              actual_x,
              actual_y,
              expected_x,
              expected_y;

          actual = result[index];
          actual_x = actual[0];
          actual_y = actual[1];
          expected_x = expected[0];
          expected_y = expected[1];

          // x-values within 2 decimals
          expect(Math.round(actual_x*100)/100).to.be.closeTo(
              expected_x, Number.EPSILON);

          // y-values within 4 decimals
          expect(Math.round(actual_y*10000)/10000).to.be.closeTo(
              expected_y, Number.EPSILON);
        });
      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        factory = null;
        done(err);
      });
    });

    it('resolves with null value when null values are given', (done) => {
      var factory;

      factory = SpectraFactory();

      factory.getSpectrum(null, null).then((result) => {

        expect(result[0][0]).to.equal(null);

      }).catch((err) => {
        return err;
      }).then((err) => {
        factory.destroy();
        factory = null;
        done(err);
      });
    });
  });
});
