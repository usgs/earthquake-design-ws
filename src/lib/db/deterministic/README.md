# deterministic database schema


## Tables

- `data`

  Deterministic mapped data values (geometric mean) for specific points.

  Each data point is part of a `region`.

- `document`

  Metadata for specific design documents, which define how
    mapped data values are interpolated and processed to generate
    deterministic hazard values.

  There may be many records in the document table for a given document,
    (identified by `name`)
  one for each region associated with the document.

- `region`

  Metadata for a grid of deterministic data values.

  A region may be referenced by multiple design documents.


## Loading the schema

- make sure the project is configured
  
  `npm run postinstall`

- run the deterministic data loader

  `node src/lib/db/deterministic/load_deterministic.js`
