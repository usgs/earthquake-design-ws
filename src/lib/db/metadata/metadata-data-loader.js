'use strict';


const AbstractDataLoader = require('../abstract-data-loader'),
    Config = require('../../util/config'),
    extend = require('extend'),
    inquirer = require('inquirer');

const config = Config().get(),
    documents = [],
    metadata = require('./metadata'),
    regions = require('./regions');


const _DEFAULTS = {
  db: null,
  documents: documents,
  indexFile: __dirname + '/./index.sql',
  metadata: metadata,
  mode: AbstractDataLoader.MODE_MISSING,
  regions: regions,
  schemaFile: __dirname + '/./schema.sql',
  schemaName: config.DB_SCHEMA_METADATA,
  schemaUser: config.DB_USER
};

// Translate metadata into documents expected by AbstractDataLoader
Object.keys(metadata).forEach((name) => {
  let regions = [];

  metadata[name].forEach((documentMetadataGroup) => {
    regions = regions.concat(documentMetadataGroup.regions);
  });
  documents.push({
    name: name,
    regions: regions
  });
});

const MetadataDataLoader = function (options) {
  let _this;

  options = extend({}, _DEFAULTS, options);
  _this = AbstractDataLoader(options);
  _this.metadata = options.metadata;


  /**
   * Insert region data.
   *
   * Using options.regions.
   *
   * @return {Promise}
   *     promise representing that all region data has been inserted.
   */
  _this._insertData = function (regionIds) {
    let promise = Promise.resolve();

    _this.documents.forEach((doc) => {
      promise = promise.then(() => {
        let insertMetadata,
            documentName = doc.name;

        insertMetadata = function () {
          let metadataPromise = Promise.resolve();

          process.stderr.write(`Loading ${documentName} document metadata\n`);

          _this.metadata[documentName].forEach((documentMetadataGroup) => {
            let metadata = documentMetadataGroup.data,
                regions = documentMetadataGroup.regions;

            regions.forEach((region) => {
              metadataPromise = metadataPromise.then(() => {
                // insert metadata for document/region combination
                return _this.db.query(`
                  SELECT id
                  FROM document
                  WHERE name=$1
                  AND region_id=$2
                `, [documentName, regionIds[region]]).then((result) => {
                  let documentId,
                      queries;

                  documentId = result.rows[0].id;
                  queries = Promise.resolve();

                  Object.keys(metadata).forEach((key) => {
                    let value = metadata[key];

                    queries = queries.then(_this.db.query(`
                      INSERT INTO metadata (
                        document_id,
                        key,
                        value
                      ) VALUES ($1, $2, $3)
                    `, [
                      documentId,
                      key,
                      value
                    ]));
                  });

                  return queries;
                });
              });
            });
          });

          return metadataPromise;
        };


        if (_this.mode === AbstractDataLoader.MODE_SILENT) {
          return insertMetadata();
        }

        return _this.db.query(`
          SELECT *
          FROM metadata
          WHERE document_id in (
            SELECT id
            FROM document
            WHERE name=$1
          )
        `, [documentName]).then((result) => {
          let skipInsertMetadata;

          if (result.rows.length === 0) {
            // no data found
            return insertMetadata();
          }

          // found existing data
          skipInsertMetadata = function () {
            process.stderr.write(`Document "${documentName}" metadata already loaded\n`);
          };

          if (_this.mode === AbstractDataLoader.MODE_MISSING) {
            // data already exists
            return skipInsertMetadata();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropMetadata',
                type: 'confirm',
                message: `Metadata for document ${documentName} already exists, drop and reload metadata`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropMetadata) {
                return _this.db.query(`
                  DELETE FROM metadata
                  WHERE document_id IN (
                    SELECT id
                    FROM document
                    WHERE name=$1
                  )
                `, [documentName]).then(() => {
                  return insertMetadata();
                });
              } else {
                return skipInsertMetadata();
              }
            });
          }
        });
      });
    });

    return promise;
  };


  options = null;
  return _this;
};

module.exports = MetadataDataLoader;
