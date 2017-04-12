# deterministic database schema

## Tables

- `data`

  Each data point is part of a `region`.

- `document`

  There may be many records in the document table for a given document,
    (identified by `name`)
  one for each region associated with the document.

- `region`

  Metadata for a grid of Risk Targeting Coefficient values.

  A region may be referenced by multiple design documents.

## Reference Data

- `documents.json`

  An array of document to region mappings.

- `regions.json`

  An array of region metadata, with `url`s to corresponding CSV data files.


## Loading the schema

- make sure the project is configured

  `npm run postinstall`

- run the deterministic data loader

  `node src/lib/db/risk-coefficient/load_risk_coefficient.js`
