'use strict';


const NumberUtils = require('../../util/number-utils').instance;

const _METADATA = {
  'ASCE7-05': [
    {
      'regions': [
        'AK0P10',
        'CANV0P01',
        'CEUS0P01',
        'HI0P02',
        'PACNW0P01',
        'PRVI0P05',
        'SLC0P01',
        'US0P05'
      ],
      'data': {
        'modelVersion': 'v2.0.x',
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR
      }
    }
  ],

  'ASCE7-10': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE41-13': [
    {
      'regions': [
        'COUS0P01',
        'AK0P05',
        'PRVI0P01'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR,
        'modelVersion': 'v3.1.x',
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'modelVersion': 'v3.1.x',
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE7-16': [
    // LogY interpolation, standard factors
    {
      'regions': [
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, standard factors
    {
      'regions': [
        'AK0P05',
        'PRVI0P01'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, custom factors
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLTE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'ASCE41-17': [
    {
      'regions': [
        'AK0P05',
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10',
        'PRVI0P01'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LOGX_LOGY_LINEAR,
        'modelVersion': 'v4.0.x',
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'curveInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'modelVersion': 'v4.0.x',
        's1MaxDirFactor': 1.0,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'IBC-2012': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'IBC-2015': [
    {
      'regions': [
        'AK0P05',
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'NEHRP-2009': [
    {
      'regions': [
        'AK0P05',
        'COUS0P01',
        'PRVI0P01'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'model_veresion': 'v3.1.x',
        'pgadFloor': 0.6,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dPercentileFactor': 1.8,
        's1dFloor': 0.6,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ],

  'NEHRP-2015': [
    // LogY interpolation, standard factors
    {
      'regions': [
        'AMSAM0P10',
        'COUS0P01',
        'GNMI0P10'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LOGY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, standard factors
    {
      'regions': [
        'AK0P05',
        'PRVI0P01'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.3,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLATE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.1,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    },
    // LinearY interpolation, custom factors
    {
      'regions': [
        'HI0P02'
      ],
      'data': {
        'modelVersion': 'v4.0.x',
        'pgadFloor': 0.5,
        'pgadPercentileFactor': 1.8,
        's1MaxDirFactor': 1.0,
        's1dFloor': 0.6,
        's1dPercentileFactor': 1.8,
        'spatialInterpolationMethod': NumberUtils.INTERPOLTE_LINEARX_LINEARY_LINEAR,
        'ssMaxDirFactor': 1.0,
        'ssdFloor': 1.5,
        'ssdPercentileFactor': 1.8
      }
    }
  ]
};

module.exports = _METADATA;
