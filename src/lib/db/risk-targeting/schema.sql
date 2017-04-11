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
  cr1 NUMERIC NOT NULL,
  crs NUMERIC NOT NULL
);

CREATE TABLE document (
  id SERIAL NOT NULL PRIMARY KEY,

  region_id INTEGER NOT NULL REFERENCES region(id),
  interpolation_method VARCHAR(255) NOT NULL,
  model_version VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);
