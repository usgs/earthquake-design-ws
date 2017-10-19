CREATE TABLE reference_document (
  id SERIAL NOT NULL PRIMARY KEY,

  value VARCHAR(255) NOT NULL,

  UNIQUE (value)
);

CREATE TABLE region (
  id SERIAL NOT NULL PRIMARY KEY,
  reference_document_id INTEGER NOT NULL REFERENCES reference_document(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  grid_spacing NUMERIC NOT NULL,
  max_latitude NUMERIC NOT NULL,
  max_longitude NUMERIC NOT NULL,
  min_latitude NUMERIC NOT NULL,
  min_longitude NUMERIC NOT NULL,


  UNIQUE (reference_document_id, name)
);

CREATE TABLE reference_document_region_bridge (
  id SERIAL NOT NULL PRIMARY KEY,

  reference_document_id INTEGER NOT NULL REFERENCES reference_document(id) ON DELETE CASCADE,
  region_id INTEGER NOT NULL REFERENCES region(id) ON DELETE CASCADE
);

CREATE TABLE metadata (
  id SERIAL NOT NULL PRIMARY KEY,
  reference_document_id INTEGER NOT NULL REFERENCES reference_document(id) ON DELETE CASCADE,

  key VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL
);
