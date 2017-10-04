CREATE INDEX IF NOT EXISTS region__bounds_idx
ON region (
  max_latitude,
  max_longitude,
  min_latitude,
  min_longitude
);

CREATE INDEX IF NOT EXISTS data__regionid_latitude_longitude_idx
ON data (
  region_id,
  latitude,
  longitude
);

CREATE INDEX IF NOT EXISTS data__regionid_idx
ON data (
  region_id
);

CREATE INDEX IF NOT EXISTS document__regionid_name_idx
ON document (
  region_id,
  name
);
