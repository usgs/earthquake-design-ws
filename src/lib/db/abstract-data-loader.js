'use strict';


const copyFrom = require('pg-copy-streams').from,
    dbUtils = require('./db-utils'),
    inquirer = require('inquirer'),
    UrlStream = require('../util/url-stream'),
    zlib = require('zlib');


const MODE_INTERACTIVE = 'interactive';
const MODE_MISSING = 'missing';
const MODE_SILENT = 'silent';


const AbstractDataLoader = function (options) {
  let _this,
      _initialize;

  _this = {};

  _initialize = function (options) {
    options = options || {};

    _this.dataColumns = options.dataColumns;
    _this.db = options.db;
    _this.documents = options.documents;
    _this.indexFile = options.indexFile;
    _this.mode = options.mode;
    _this.regions = options.regions;
    _this.schemaFile = options.schemaFile;
    _this.schemaName = options.schemaName;
    _this.schemaUser = options.schemaUser;
    _this.dataLoadOpts = options.dataLoadOpts;
  };

  /**
   * Create database schema.
   *
   * Based on options.schemaFile, options.schemaName, and options.schemaUser.
   *
   * @return {Promise}
   *     promise representing schema has been created.
   */
  _this._createSchema = function () {
    let createSchema;

    if (!_this.schemaName || !_this.schemaUser) {
      throw new Error('schema name not configured');
    }

    createSchema = function () {
      return dbUtils.createSchema({
        db: _this.db,
        file: _this.schemaFile,
        name: _this.schemaName,
        user: _this.schemaUser
      });
    };

    if (_this.mode === MODE_SILENT) {
      // Recreate schema
      return createSchema();
    }

    return _this.db.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = $1
    `, [_this.schemaName]).then((result) => {
      if (result.rows.length === 0) {
        return createSchema();
      } else {
        let skipCreateSchema = function () {
          return _this.db.query('SET search_path TO ' + _this.schemaName);
        };

        if (_this.mode === MODE_MISSING) {
          return skipCreateSchema();
        } else {
          let prompt = inquirer.createPromptModule();
          return prompt([
            {
              name: 'createSchema',
              type: 'confirm',
              message: `Schema ${_this.schemaName} already exists, drop and reload schema`,
              default: false
            }
          ]).then((answers) => {
            if (answers.createSchema) {
              return createSchema();
            } else {
              return skipCreateSchema();
            }
          });
        }
      }
    });
  };

  /**
   * Insert region metadata.
   *
   * Using options.regions.
   *
   * @return {Promise<Array<String, Int>>}
   *     resolves to mapping from region name to region id.
   */
  _this._insertRegions = function () {
    let promise,
        regions,
        regionIds;

    // TODO: get existing regions and filter if only loading missing
    // but may need to pass all regionIds for insertDocuments
    regions = _this.regions;

    // load regions
    promise = Promise.resolve();

    regionIds = {};
    regions.forEach((region) => {
      promise = promise.then(() => {
        let insertRegion;

        insertRegion = function () {
          return _this.db.query(`
            INSERT INTO region (
              name,
              grid_spacing,
              max_latitude,
              max_longitude,
              min_latitude,
              min_longitude
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
          `, [
                region.name,
                region.grid_spacing,
                region.max_latitude,
                region.max_longitude,
                region.min_latitude,
                region.min_longitude
              ]).then((result) => {
            // save region id for later data loading
            regionIds[region.name] = result.rows[0].id;
          });
        };

        if (_this.mode === MODE_SILENT) {
          return insertRegion();
        }

        return _this.db.query(`
          SELECT id
          FROM region
          WHERE name=$1
        `, [region.name]).then((result) => {
          if (result.rows.length == 0) {
            // region not found
            return insertRegion();
          }

          // found existing region
          let regionId,
              skipInsertRegion;

          regionId = result.rows[0].id;
          skipInsertRegion = function () {
            // save region id for later data loading
            regionIds[region.name] = regionId;
          };

          if (_this.mode === MODE_MISSING) {
            // region already exists
            return skipInsertRegion();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropRegion',
                type: 'confirm',
                message: `Region ${region.name} already exists, drop and reload region`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropRegion) {
                return _this.db.query(`
                  DELETE FROM region
                  WHERE id=$1
                `, [regionId]).then(() => {
                  return insertRegion();
                });
              } else {
                return skipInsertRegion();
              }
            });
          }
        });
      });
    });

    return promise.then(() => {
      // all regions inserted, and IDs should be set
      return regionIds;
    });
  };

  /**
   * Insert document metadata.
   *
   * Using options.documents.
   *
   * @return {Promise}
   *     promise representing document metadata being inserted.
   */
  _this._insertDocuments = function (regionIds) {
    let promise;

    promise = Promise.resolve();

    _this.documents.forEach((doc) => {
      promise = promise.then(() => {
        let insertDocument;

        insertDocument = function () {
          let queries = Promise.resolve();

          doc.regions.forEach((region) => {
            let regionId;

            if (!regionIds.hasOwnProperty(region)) {
              throw new Error('Region "' + region + '" not found' +
                  ', inserting document ' + doc.name);
            }
            regionId = regionIds[region];

            queries = queries.then(_this.db.query(`
              INSERT INTO document (
                region_id,
                name
              ) VALUES ($1, $2)
            `, [
                  regionId,
                  doc.name
                ]));
          });

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertDocument();
        }

        return _this.db.query(`
          SELECT id
          FROM document
          WHERE name=$1
        `, [
          doc.name
        ]).then((result) => {
          if (result.rows.length == 0) {
            // document does not exist
            return insertDocument();
          }

          // found existing document
          let documentId,
              skipInsertDocument;

          documentId = result.rows[0].id;
          skipInsertDocument = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // document already exists
            return skipInsertDocument();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropDocument',
                type: 'confirm',
                message: `Document ${doc.name} already exists, drop and reload document`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropDocument) {
                return _this.db.query(`
                  DELETE FROM document
                  WHERE id=$1
                `, [documentId]).then(() => {
                  return insertDocument();
                });
              } else {
                return skipInsertDocument();
              }
            });
          }
        });
      });
    });

    return promise;
  };

  /**
   * Insert region data.
   *
   * Using options.regions.
   *
   * @return {Promise}
   *     promise representing that all region data has been inserted.
   */
  _this._insertData = function (regionIds) {
    let promise;

    promise = Promise.resolve();

    _this.regions.forEach((region) => {
      // run each region load in sequence
      promise = promise.then(() => {
        let insertData;

        insertData = function () {
          process.stderr.write('Loading ' + region.name + ' region data\n');

          // TODO: check whether data already loaded

          return dbUtils.exec(_this.db, [
            'DROP TABLE IF EXISTS temp_region_data CASCADE',
            // create temporary table for loading data,
            // based on actual data schema
            'CREATE TABLE temp_region_data (LIKE data)',
            // CSV file doesn't include "id" or "region_id" columns.
            'ALTER TABLE temp_region_data DROP COLUMN id, DROP COLUMN region_id'
          ]).then(() => {
            // use copy from to read data
            return new Promise((resolve, reject) => {
              var data,
                  doReject,
                  doResolve,
                  stream;

              data = UrlStream({
                url: region.url
              });

              stream = _this.db.query(copyFrom(`
                  COPY temp_region_data
                  FROM STDIN ` +
                  _this.dataLoadOpts
              ));

              doReject = (err) => {
                data.destroy();
                reject(err);
              };

              doResolve = () => {
                data.destroy();
                resolve();
              };

              data.on('error', doReject);
              stream.on('error', doReject);
              stream.on('end', doResolve);
              data.pipe(zlib.createGunzip()).pipe(stream);
            });
          }).then(() => {
            // transfer data into actual table
            //nextval(pg_get_serial_sequence('data', 'id')),
            return _this.db.query(`
              INSERT INTO data (region_id, ${_this.dataColumns.join(', ')}) (
                SELECT
                  $1,
                  *
                  FROM temp_region_data
              )
            `, [regionIds[region.name]]);
          }).then(() => {
            // remove temporary table
            return _this.db.query('DROP TABLE temp_region_data CASCADE');
          });
        };


        if (_this.mode === MODE_SILENT) {
          return insertData();
        }

        return _this.db.query(`
          SELECT min(region_id) as region_id
          FROM data
          WHERE region_id=$1
        `, [regionIds[region.name]]).then((result) => {
          let regionId,
              skipInsertData;

          regionId = Number(result.rows[0].region_id);
          if (regionId !== regionIds[region.name]) {
            // data not found
            return insertData();
          }

          // found existing data
          skipInsertData = function () {
            process.stderr.write(`Region "${region.name}" data already loaded\n`);
          };

          if (_this.mode === MODE_MISSING) {
            // data already exists
            return skipInsertData();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropData',
                type: 'confirm',
                message: `Data for region ${region.name} already exists, drop and reload data`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropData) {
                return _this.db.query(`
                  DELETE FROM data
                  WHERE id=$1
                `, [regionId]).then(() => {
                  return insertData();
                });
              } else {
                return skipInsertData();
              }
            });
          }
        });
      });
    });

    return promise;
  };

  /**
   * Create indexes.
   *
   * @return {Promise}
   *     promise representing that all indexes have been created.
   */
  _this._createIndexes = function () {
    return dbUtils.readSqlFile(_this.indexFile).then((statements) => {
      return dbUtils.exec(_this.db, statements);
    });
  };


  /**
   * Run data loader using configured options.
   *
   * @return {Promise}
   *     promise representing that all data has been loaded.
   */
  _this.run = function () {
    let createIndexes,
        createSchema,
        insertData,
        insertDocuments,
        insertRegions;

    // set order of load operations
    createSchema = _this._createSchema();
    insertRegions = createSchema.then(_this._insertRegions);
    insertDocuments = insertRegions.then(_this._insertDocuments);
    insertData = insertDocuments.then(() => {
      // need region ids from insertRegions
      return insertRegions.then(_this._insertData);
    });
    createIndexes = insertData.then(_this._createIndexes);

    return createIndexes;
  };


  _initialize(options);
  options = null;
  return _this;
};


AbstractDataLoader.MODE_INTERACTIVE = MODE_INTERACTIVE;
AbstractDataLoader.MODE_MISSING = MODE_MISSING;
AbstractDataLoader.MODE_SILENT = MODE_SILENT;


module.exports = AbstractDataLoader;
