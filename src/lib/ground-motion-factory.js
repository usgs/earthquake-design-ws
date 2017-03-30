'use strict';


/**
 * Factory for performing linear interpolation of ground motion
 *
 * @param options {Object}
 *     Configuration options for this factory. See #_initialize for details.
 */
var GroundMotionFactory = function () {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   * Instantiates a new instance of a GroundMotionFactory
   *
   * @param options {Object}
   */
  _initialize = function () {

  };

  /**
   * Frees resources associated with this factory.
   *
   */
  _this.destroy = function () {
    if (_this === null) {
      return;
    }

    _initialize = null;
    _this = null;
  };

  /**
   * Interpolates between 4, 2, or 1-point(s)
   *
   * @param data {array}
   *        an object with up to four grided points and reference lat/lon
   *        {
   *          points: [
   *            {
   *              'latitude': {number},
   *              'longitude': {number},
   *              'ss': {number},
   *              's1': {number}
   *            },
   *            ...
   *          ],
   *          latitude: {number},
   *          longitude: {number}
   *       }
   *
   * @return {object}
   *         The interpolated ground motion
   */
  _this.interpolate = function (data) {
    var latitude,
        lat1,
        lat2,
        lat3,
        longitude,
        lng1,
        lng2,
        lng3,
        lng4,
        points,
        resultLat1,
        resultLat3,
        resultSS,
        resultS1;

    latitude = data.latitude;
    longitude = data.longitude;
    points = data.points;

    if (points.length === 1) {
      resultSS = points[0].ss;
      resultS1 = points[0].s1;

    } else if (points.length === 2) {
      lat1 = points[0].latitude;
      lat2 = points[1].latitude;
      lng1 = points[0].longitude;
      lng2 = points[1].longitude;

      if (lat1 === lat2) {
        // interpolate for ss
        resultSS = _this.interpolateValue(
            lng1,
            lng2,
            points[0].ss,
            points[1].ss,
            longitude);

        // interpolate for s1
        resultS1 = _this.interpolateValue(
            lng1,
            lng2,
            points[0].s1,
            points[1].s1,
            longitude);

      } else if (lng1 === lng2) {
        // interpolate for ss
        resultSS = _this.interpolateValue(
            lat1,
            lat2,
            points[0].ss,
            points[1].ss,
            latitude);

        // interpolate for s1
        resultS1 = _this.interpolateValue(
            lat1,
            lat2,
            points[0].s1,
            points[1].s1,
            latitude);

      } else {
        throw new Error('Lat or Lng don\'t match and only 2 data points');
      }
    } else if (points.length === 4) {
      lat1 = points[0].latitude;
      lat3 = points[2].latitude;

      lng1 = points[0].longitude;
      lng2 = points[1].longitude;
      lng3 = points[2].longitude;
      lng4 = points[3].longitude;

      // interpolate for ss
      resultLat1 = _this.interpolateValue(
          lng1,
          lng2,
          points[0].ss,
          points[1].ss,
          longitude);

      resultLat3 = _this.interpolateValue(
          lng3,
          lng4,
          points[2].ss,
          points[3].ss,
          longitude);

      resultSS = _this.interpolateValue(
          lat1,
          lat3,
          resultLat1,
          resultLat3,
          latitude);

      // interpolate for s1
      resultLat1 = _this.interpolateValue(
          lng1,
          lng2,
          points[0].s1,
          points[1].s1,
          longitude);

      resultLat3 = _this.interpolateValue(
          lng3,
          lng4,
          points[2].s1,
          points[3].s1,
          longitude);

      resultS1 = _this.interpolateValue(
          lat1,
          lat3,
          resultLat1,
          resultLat3,
          latitude);

    } else {
      throw new Error('Does not have 1, 2, or 4 points.');
    }

    return {
      'latitude': latitude,
      'longitude': longitude,
      'ss': resultSS,
      's1': resultS1
    };
  };

  /**
   * Performs generic linear interpolation.
   *
   * @param xmin {Double}
   *     The lower x-value
   * @param xmax {Double}
   *     The upper x-value
   * @param ymin {Double}
   *     The lower y-value
   * @param ymax {Double}
   *     The upper y-value
   * @param x {Double}
   *     The target x-value
   *
   * @return {Double}
   *     The interpolated y-value corresponding to the input target x-value.
   */
  _this.interpolateValue = function (xmin, xmax, ymin, ymax, x) {
    return ymin + ((x - xmin) * ((ymax - ymin) / (xmax - xmin)));
  };


  _initialize();
  return _this;
};


module.exports = GroundMotionFactory;