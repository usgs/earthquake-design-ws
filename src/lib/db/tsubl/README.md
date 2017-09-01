# deterministic database schema


## Tables

- `data`

  T-Sub-L data.

  Each row represents a multi-polygonal `region`.

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


## Reference Data

- `documents.json`

  An array of document to region mappings.

- `regions.json`

  An array of region metadata, with `url`s to corresponding CSV data files.


## Loading the schema

- make sure the project is configured
  
  `npm run postinstall`

- run the deterministic data loader

  `node src/lib/db/tsubl/load_tsubl.js`
