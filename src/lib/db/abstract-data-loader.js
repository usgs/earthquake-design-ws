'use strict';


const copyFrom = require('pg-copy-streams').from,
    dbUtils = require('./db-utils'),
    UrlStream = require('../util/url-stream'),
    zlib = require('zlib');


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
    _this.regions = options.regions;
    _this.schemaFile = options.schemaFile;
    _this.schemaName = options.schemaName;
    _this.schemaUser = options.schemaUser;
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
    if (!_this.schemaName || !_this.schemaUser) {
      throw new Error('schema name not configured');
    }

    // TODO: check if schema already exists

    return dbUtils.createSchema({
      db: _this.db,
      file: _this.schemaFile,
      name: _this.schemaName,
      user: _this.schemaUser
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
    let promise,
        documents;

    promise = Promise.resolve();
    _this.documents.forEach((doc) => {
      doc.regions.forEach((region) => {
        var regionId;

        if (!regionIds.hasOwnProperty(region)) {
          throw new Error('Region "' + region + '" not found' +
              ', inserting document ' + doc.name);
        }
        regionId = regionIds[region];

        // TODO: check for existing documents

        promise = promise.then(() => {
          return _this.db.query(`
            INSERT INTO document (
              region_id,
              name
            ) VALUES ($1, $2)
          `, [
            regionId,
            doc.name
          ]);
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
    let promise,
        regions;

    promise = Promise.resolve();

    _this.regions.forEach((region) => {
      // run each region load in sequence
      promise = promise.then(() => {
        process.stderr.write('Loading ' + region.name + ' region data\n');

        // TODO: check whether data already loaded

        return _this.db.query(
            'DROP TABLE IF EXISTS temp_region_data CASCADE').then(() => {
          // create temporary table for loading data,
          // based on actual data schema
          return _this.db.query(
              'CREATE TABLE temp_region_data (LIKE data)').then(() => {
            // CSV file doesn't include "region_id" column.
            return _this.db.query(
                'ALTER TABLE temp_region_data DROP COLUMN id, DROP COLUMN region_id');
          });
        }).then(() => {
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
                FROM STDIN
                WITH CSV HEADER
            `));

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
    insertData = insertRegions.then(_this._insertData);
    createIndexes = Promise.all([insertData, insertDocuments]).then(_this._createIndexes);

    return createIndexes;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = AbstractDataLoader;
