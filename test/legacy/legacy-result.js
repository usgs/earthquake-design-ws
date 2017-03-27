'use strict';

module.exports = {
  'input': {
    'title': 'Test',
    'latitude': 34.01,
    'longitude': -118.01,
    'design_code': 1,
    'risk_category': 1,
    'site_class': 5
  },
  'output': {
    'data': [
      {
        'latitude': 34.01,
        'longitude': -118.01,
        'mapped_ss': 1.89193988,
        'mapped_s1': 0.56859791,
        'mapped_pga': 0.80798329,
        'crs': 0.89778911,
        'cr1': 0.89946313,
        'geomean_ssd': 1.1948892,
        'geomean_s1d': 0.3996068,
        'geomean_pgad': 0.5514122
      }
    ],
    'metadata': {
      'region_name': 'Conterminous US',
      'region_id': 6,
      'max_direction_ss': 1.1,
      'max_direction_s1': 1.3,
      'percentile_ss': 1.8,
      'percentile_s1': 1.8,
      'percentile_pga': 1.8,
      'deterministic_floor_ss': 1.5,
      'deterministic_floor_s1': 0.6,
      'deterministic_floor_pga': 0.5,
      'grid_spacing': 0.01,
      'interpolation_method': 'linearlog'
    },
    'tl': 8
  }
};
