/* global describe, it */
'use strict';


const expect = require('chai').expect,
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
        let factory;

        factory = SpectraFactory();
        factory.destroy();
        factory = null;
      }).to.not.throw(Error);
    });
  });

  describe('getHorizontalSpectrum', () => {

    it('properly compute a spectra', (done) => {
      let factory = SpectraFactory();

      factory.getHorizontalSpectrum(1.5384, 0.8248, 4).then((result) => {

        // TODO: Ask @nluco-usgs to review these values
        let expectation = [
          [0, 0.6154],
          [0.025, 0.8306],
          [0.05, 1.0458],
          [0.1, 1.4762],
          [0.107, 1.5384],
          [0.15, 1.5384],
          [0.2, 1.5384],
          [0.25, 1.5384],
          [0.3, 1.5384],
          [0.35, 1.5384],
          [0.4, 1.5384],
          [0.45, 1.5384],
          [0.5, 1.5384],
          [0.536, 1.5384],
          [0.55, 1.4996],
          [0.6, 1.3747],
          [0.65, 1.2689],
          [0.7, 1.1783],
          [0.75, 1.0997],
          [0.8, 1.031],
          [0.85, 0.9704],
          [0.9, 0.9164],
          [0.95, 0.8682],
          [1, 0.8248],
          [1.05, 0.7855],
          [1.1, 0.7498],
          [1.15, 0.7172],
          [1.2, 0.6873],
          [1.25, 0.6598],
          [1.3, 0.6345],
          [1.35, 0.611],
          [1.4, 0.5891],
          [1.45, 0.5688],
          [1.5, 0.5499],
          [1.55, 0.5321],
          [1.6, 0.5155],
          [1.65, 0.4999],
          [1.7, 0.4852],
          [1.75, 0.4713],
          [1.8, 0.4582],
          [1.85, 0.4458],
          [1.9, 0.4341],
          [1.95, 0.423],
          [2, 0.4124],
          [2.05, 0.4023],
          [2.1, 0.3928],
          [2.15, 0.3836],
          [2.2, 0.3749],
          [2.25, 0.3666],
          [2.3, 0.3586],
          [2.35, 0.351],
          [2.4, 0.3437],
          [2.45, 0.3367],
          [2.5, 0.3299],
          [2.55, 0.3235],
          [2.6, 0.3172],
          [2.65, 0.3112],
          [2.7, 0.3055],
          [2.75, 0.2999],
          [2.8, 0.2946],
          [2.85, 0.2894],
          [2.9, 0.2844],
          [2.95, 0.2796],
          [3, 0.2749],
          [3.05, 0.2704],
          [3.1, 0.2661],
          [3.15, 0.2618],
          [3.2, 0.2578],
          [3.25, 0.2538],
          [3.3, 0.2499],
          [3.35, 0.2462],
          [3.4, 0.2426],
          [3.45, 0.2391],
          [3.5, 0.2357],
          [3.55, 0.2323],
          [3.6, 0.2291],
          [3.65, 0.226],
          [3.7, 0.2229],
          [3.75, 0.2199],
          [3.8, 0.2171],
          [3.85, 0.2142],
          [3.9, 0.2115],
          [3.95, 0.2088],
          [4, 0.2062],
          [4.05, 0.2011],
          [4.1, 0.1963],
          [4.15, 0.1916],
          [4.2, 0.187],
          [4.25, 0.1827],
          [4.3, 0.1784],
          [4.35, 0.1744],
          [4.4, 0.1704],
          [4.45, 0.1666],
          [4.5, 0.1629],
          [4.55, 0.1594],
          [4.6, 0.1559],
          [4.65, 0.1526],
          [4.7, 0.1494],
          [4.75, 0.1462],
          [4.8, 0.1432],
          [4.85, 0.1403],
          [4.9, 0.1374],
          [4.95, 0.1346],
          [5, 0.132]
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

          // x-values within 3 decimals
          expect(Math.round(actual_x*1000)/1000).to.be.closeTo(
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
      let factory;

      factory = SpectraFactory();

      factory.getHorizontalSpectrum(null).then((result) => {
        expect(result[0][0]).to.equal(null);
        done();
      }).catch(done);
    });

  });

  describe('getTimeValues', () => {
    it('returns an Array', () => {
      let factory;

      factory = SpectraFactory();

      expect(factory.getTimeValues(1.0, 0.5, 4)).to.be.instanceof(Array);

      factory.destroy();
    });

    it('properly compute time values', () => {
      let expectation,
          factory,
          result;

      factory = SpectraFactory();
      try {
        result = factory.getTimeValues(1.5384, 0.8248, 4);

        expectation = [
          0.00,
          0.025,
          0.05,
          0.10,
          0.107,
          0.15,
          0.20,
          0.25,
          0.30,
          0.35,
          0.40,
          0.45,
          0.50,
          0.536,
          0.55,
          0.60,
          0.65,
          0.70,
          0.75,
          0.80,
          0.85,
          0.90,
          0.95,
          1.00,
          1.05,
          1.10,
          1.15,
          1.20,
          1.25,
          1.30,
          1.35,
          1.40,
          1.45,
          1.50,
          1.55,
          1.60,
          1.65,
          1.70,
          1.75,
          1.80,
          1.85,
          1.90,
          1.95,
          2.00,
          2.05,
          2.10,
          2.15,
          2.20,
          2.25,
          2.30,
          2.35,
          2.40,
          2.45,
          2.50,
          2.55,
          2.60,
          2.65,
          2.70,
          2.75,
          2.80,
          2.85,
          2.90,
          2.95,
          3.00,
          3.05,
          3.10,
          3.15,
          3.20,
          3.25,
          3.30,
          3.35,
          3.40,
          3.45,
          3.50,
          3.55,
          3.60,
          3.65,
          3.70,
          3.75,
          3.80,
          3.85,
          3.90,
          3.95,
          4.00,
          4.05,
          4.10,
          4.15,
          4.20,
          4.25,
          4.30,
          4.35,
          4.40,
          4.45,
          4.50,
          4.55,
          4.60,
          4.65,
          4.70,
          4.75,
          4.80,
          4.85,
          4.90,
          4.95,
          5.00
        ];

        expectation.forEach((expected, index) => {
          let actual;

          actual = result[index];

          // x-values within 2 decimals
          expect(Math.round(actual*1000)/1000).to.be.closeTo(
              expected, Number.EPSILON);
        });
      } finally {
        factory.destroy();
        factory = null;
      }
    });

    it('properly compute time values when time values are duplicated', () => {
      let expectation,
          factory,
          result;

      factory = SpectraFactory();

      try {
        result = factory.getTimeValues(1.5384, 2.0, 4);
        expectation = [
          0.00,
          0.025,
          0.05,
          0.10,
          0.15,
          0.20,
          0.25,
          0.30,
          0.35,
          0.40,
          0.45,
          0.50,
          0.55,
          0.60,
          0.65,
          0.70,
          0.75,
          0.80,
          0.85,
          0.90,
          0.95,
          1.00,
          1.05,
          1.10,
          1.15,
          1.20,
          1.25,
          1.30,
          1.35,
          1.40,
          1.45,
          1.50,
          1.55,
          1.60,
          1.65,
          1.70,
          1.75,
          1.80,
          1.85,
          1.90,
          1.95,
          2.00,
          2.05,
          2.10,
          2.15,
          2.20,
          2.25,
          2.30,
          2.35,
          2.40,
          2.45,
          2.50,
          2.55,
          2.60,
          2.65,
          2.70,
          2.75,
          2.80,
          2.85,
          2.90,
          2.95,
          3.00,
          3.05,
          3.10,
          3.15,
          3.20,
          3.25,
          3.30,
          3.35,
          3.40,
          3.45,
          3.50,
          3.55,
          3.60,
          3.65,
          3.70,
          3.75,
          3.80,
          3.85,
          3.90,
          3.95,
          4.00,
          4.05,
          4.10,
          4.15,
          4.20,
          4.25,
          4.30,
          4.35,
          4.40,
          4.45,
          4.50,
          4.55,
          4.60,
          4.65,
          4.70,
          4.75,
          4.80,
          4.85,
          4.90,
          4.95,
          5.00
        ];

        expectation.forEach((expected, index) => {
          let actual;

          actual = result[index];

          // x-values within 2 decimals
          expect(Math.round(actual*1000)/1000).to.be.closeTo(
              expected, Number.EPSILON);
        });
      } finally {
        factory.destroy();
        factory = null;
      }
    });

    it('resolves with null value when null values are given', () => {
      let factory,
          result;

      factory = SpectraFactory();

      try {
        result = factory.getTimeValues(null, null, null);

        expect(result[0]).to.equal(null);
      } finally {
        factory.destroy();
        factory = null;
      }
    });

    describe('getVerticalSpectrum', () => {

      it('properly compute a spectra', (done) => {
        let factory = SpectraFactory();

        /**
         * The arguments in the test below come from the use of these paramters
         * in the ASCE7-16 service.
         * "latitude": 34,
         * "longitude": -118,
         * "riskCategory": "III",
         * "siteClass": "C",
         * "title": "Example"
         **/
        factory.getVerticalSpectrum(2.265, 0.936, 1.1).then((result) => {

          // TODO: Ask @nluco-usgs to review these values
          let expectation = [
            [0, 0.7475],
            [0.025, 0.7475],
            [0.05, 1.9932],
            [0.083, 1.9932],
            [0.1, 1.9932],
            [0.15, 1.9932],
            [0.2, 1.6064],
            [0.25, 1.3588],
            [0.3, 1.1852],
            [0.35, 1.0558],
            [0.4, 0.9552],
            [0.413, 0.9321],
            [0.45, 0.8744],
            [0.5, 0.808],
            [0.55, 0.7522],
            [0.6, 0.7047],
            [0.65, 0.6636],
            [0.7, 0.6278],
            [0.75, 0.5961],
            [0.8, 0.5679],
            [0.85, 0.5427],
            [0.9, 0.5199],
            [0.95, 0.4993],
            [1, 0.4804],
            [1.05, 0.4632],
            [1.1, 0.4473],
            [1.15, 0.4326],
            [1.2, 0.419],
            [1.25, 0.4064],
            [1.3, 0.3946],
            [1.35, 0.3836],
            [1.4, 0.3733],
            [1.45, 0.3636],
            [1.5, 0.3544],
            [1.55, 0.3458],
            [1.6, 0.3377],
            [1.65, 0.33],
            [1.7, 0.3227],
            [1.75, 0.3157],
            [1.8, 0.3091],
            [1.85, 0.3029],
            [1.9, 0.2969],
            [1.95, 0.2911],
            [2, 0.2857]
          ];

          expectation.forEach((expected, index) => {

            let actual,
                actual_x,
                actual_y,
                expected_x,
                expected_y;

            actual = result[index];
            actual_x = actual[0];
            actual_y = actual[1];
            expected_x = expected[0];
            expected_y = expected[1];

            // x-values within 3 decimals
            expect(Math.round(actual_x*1000)/1000).to.be.closeTo(
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
        let factory;

        factory = SpectraFactory();

        factory.getHorizontalSpectrum(null).then((result) => {
          expect(result[0][0]).to.equal(null);
          done();
        }).catch(done);
      });
    });
  });
});
