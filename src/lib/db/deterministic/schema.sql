CREATE TABLE region (
  id SERIAL NOT NULL,

  grid_spacing NUMERIC NOT NULL,
  max_latitude NUMERIC NOT NULL,
  max_longitude NUMERIC NOT NULL,
  min_latitude NUMERIC NOT NULL,
  min_longitude NUMERIC NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT det_region_pkey PRIMARY KEY (name)
);

CREATE TABLE data (
  id SERIAL NOT NULL,
  region_id INTEGER NOT NULL REFERENCES region(id),

  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  pgad NUMERIC DEFAULT NULL,
  s1d NUMERIC DEFAULT NULL,
  ssd NUMERIC DEFAULT NULL,
  CONSTRAINT det_data_key PRIMARY KEY (region_id, latitude, longitude, pgad, s1d, ssd)
);

CREATE TABLE document (
  id SERIAL NOT NULL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES region(id),

  name VARCHAR(255) NOT NULL
);
