CREATE INDEX IF NOT EXISTS region__bounds_idx
ON region (
  max_latitude,
  max_longitude,
  min_latitude,
  min_longitude
);

CREATE INDEX IF NOT EXISTS metadata__documentid_key_idx
ON metadata (
  document_id,
  key
);

CREATE INDEX IF NOT EXISTS document__regionid_name_idx
ON document (
  region_id,
  name
);
