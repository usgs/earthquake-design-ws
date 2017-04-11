# probabilistic database schema


## Tables

- `data`

  Probabilistic mapped data values for specific points.

  Each data point is part of a `region`.

- `document`

  Metadata for specific design documents, which define how
    mapped data values are interpolated and processed to generate
    probabilistic hazard values.

  There may be many records in the document table for a given document,
    (identified by `name`)
  one for each region associated with the document.

- `region`

  Metadata for a grid of probabilistic data values.

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

  `node src/lib/db/probabilistic/load_probabilistic.js`
