CREATE TABLE region (
  id SERIAL NOT NULL PRIMARY KEY,

  grid_spacing NUMERIC NOT NULL,
  max_latitude NUMERIC NOT NULL,
  max_longitude NUMERIC NOT NULL,
  min_latitude NUMERIC NOT NULL,
  min_longitude NUMERIC NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE data (
  id SERIAL NOT NULL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES region(id) ON DELETE CASCADE,

  value integer NOT NULL,
  shape public.geography(Geometry,4326) NOT NULL
);

CREATE TABLE document (
  id SERIAL NOT NULL,
  region_id INTEGER NOT NULL REFERENCES region(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  UNIQUE (region_id, name)
);
