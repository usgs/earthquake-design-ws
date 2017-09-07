CREATE TABLE region (
  id SERIAL NOT NULL PRIMARY KEY,

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

  name VARCHAR(255) NOT NULL
);
