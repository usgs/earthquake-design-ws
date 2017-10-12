CREATE TABLE lookup (
  id SERIAL NOT NULL PRIMARY KEY,

  reference_document VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,

  UNIQUE (reference_document, type)
);

CREATE TABLE site_classes (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  site_class VARCHAR(255) NOT NULL,
  bin NUMERIC[] NOT NULL,

  UNIQUE (lookup_id, site_class)
);

CREATE TABLE restriction (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  site_class VARCHAR(255) NOT NULL,
  site_class_limit NUMERIC NOT NULL,
  site_class_limit_message VARCHAR(255) NOT NULL,

  UNIQUE (lookup_id, site_class)
);


CREATE TABLE bins (
  id SERIAL NOT NULL PRIMARY KEY,
  lookup_id INTEGER NOT NULL REFERENCES lookup(id) ON DELETE CASCADE,

  bin NUMERIC[] NOT NULL,

  UNIQUE (lookup_id)
);
