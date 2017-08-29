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
  id SERIAL,
  region_id INTEGER NOT NULL REFERENCES region(id),

  value integer NOT NULL,
  shape public.geography(Geometry,4326) NOT NULL,
  CONSTRAINT tl_data_pkey PRIMARY KEY (id)
);

CREATE TABLE document (
  id SERIAL NOT NULL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES region(id),

  model_version VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  spatial_interpolation_method VARCHAR(255) NOT NULL
);