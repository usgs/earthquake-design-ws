CREATE INDEX IF NOT EXISTS document__regionid_name_idx
ON document (
  region_id,
  name
);