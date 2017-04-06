CREATE TABLE region (
  id SERIAL NOT NULL PRIMARY KEY,

  grid_spacing NUMERIC NOT NULL,
  max_latitude NUMERIC NOT NULL,
  max_longitude NUMERIC NOT NULL,
  min_latitude NUMERIC NOT NULL,
  min_longitude NUMERIC NOT NULL,
  name VARCHAR(255) NOT NULL
);


CREATE TABLE data (
  id SERIAL NOT NULL PRIMARY KEY,

  region_id INTEGER NOT NULL REFERENCES region(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  mapped_pgad NUMERIC NOT NULL,
  mapped_s1d NUMERIC NOT NULL,
  mapped_ssd NUMERIC NOT NULL
);


CREATE TABLE document (
  id SERIAL NOT NULL PRIMARY KEY,

  region_id INTEGER NOT NULL REFERENCES region(id),
  floor_pgad NUMERIC NOT NULL,
  floor_s1d NUMERIC NOT NULL,
  floor_ssd NUMERIC NOT NULL,
  interpolation_method VARCHAR(255) NOT NULL,
  max_direction_pgad NUMERIC NOT NULL,
  max_direction_s1d NUMERIC NOT NULL,
  max_direction_ssd NUMERIC NOT NULL,
  model_version VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  percentile_pgad NUMERIC NOT NULL,
  percentile_s1d NUMERIC NOT NULL,
  percentile_ssd NUMERIC NOT NULL
);
