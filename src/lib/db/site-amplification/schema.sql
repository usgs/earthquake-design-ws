
CREATE TABLE lookup (
  id SERIAL NOT NULL PRIMARY KEY,

  reference_document VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,

  UNIQUE (reference_document, type)
);

CREATE TABLE amplification_factor (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  site_class VARCHAR(255) NOT NULL,
  value NUMERIC[] NOT NULL,

  UNIQUE (lookup_id, site_class)
);

CREATE TABLE restriction (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  site_class VARCHAR(255) NOT NULL,
  "limit" NUMERIC NOT NULL,
  message VARCHAR(255) NOT NULL,

  UNIQUE (lookup_id, site_class)
);

CREATE TABLE ground_motion_level (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  value NUMERIC[] NOT NULL,

  UNIQUE (lookup_id)
);
