'use strict';

var copyFrom = require('pg-copy-streams').from,
    dbUtils = require('../db-utils'),
    UrlStream = require('../../util/url-stream'),
    zlib = require('zlib');


// variables/data
var config = require('../../../conf/config.json'),
    db,
    documents = require('./documents.json'),
    regions = require('./regions.json');

// methods
var connectDatabase,
    createSchema,
    insertRegions,
    insertDocuments,
    insertData;


/**
 * Get admin database connection.
 *
 * Sets `db` variable used by other methods below.
 */
connectDatabase = dbUtils.getAdminDb().then((adminDb) => {
  db = adminDb;
});


/**
 * Create database schema.
 *
 * Based on config.DB_SCHEMA_DETERMINISTIC.
 *
 * @return {Promise}
 *     promise representing schema has been created.
 */
createSchema = connectDatabase.then(() => {
  var schemaName,
      schemaUser;

  schemaName = config.DB_SCHEMA_DETERMINISTIC;
  schemaUser = config.DB_USER;
  if (!schemaName || !schemaUser) {
    throw new Error('deterministic schema name not configured');
  }

  return dbUtils.createSchema({
    db: db,
    file: __dirname + '/./schema.sql',
    name: config.DB_SCHEMA_DETERMINISTIC,
    user: config.DB_USER
  });
});


/**
 * Insert region metadata.
 *
 * @return {Promise<Array<String, Int>>}
 *     resolves to mapping from region name to region id.
 */
insertRegions = createSchema.then(() => {
  var promise,
      regionIds;

  // load regions
  promise = Promise.resolve();
  regionIds = {};
  regions.forEach((region) => {
    promise = promise.then(() => {
      return db.query(`
        INSERT INTO region (
          grid_spacing,
          max_latitude,
          max_longitude,
          min_latitude,
          min_longitude,
          name
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        region.grid_spacing,
        region.max_latitude,
        region.max_longitude,
        region.min_latitude,
        region.min_longitude,
        region.name
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
});


/**
 * Insert document metadata.
 *
 * @return {Promise}
 *     promise representing document metadata being inserted.
 */
insertDocuments = insertRegions.then((regionIds) => {
  var promise;

  promise = Promise.resolve();
  documents.forEach((doc) => {
    doc.regions.forEach((region) => {
      var regionId;

      if (!regionIds.hasOwnProperty(region)) {
        throw new Error('Region "' + region + '" not found' +
            ', inserting document ' + doc.name);
      }
      regionId = regionIds[region];

      promise = promise.then(() => {
        return db.query(`
          INSERT INTO document (
            region_id,
            floor_pgad,
            floor_s1d,
            floor_ssd,
            interpolation_method,
            name,
            max_direction_pgad,
            max_direction_s1d,
            max_direction_ssd,
            percentile_pgad,
            percentile_s1d,
            percentile_ssd
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          regionId,
          doc.floor_pgad,
          doc.floor_s1d,
          doc.floor_ssd,
          doc.interpolation_method,
          doc.name,
          doc.max_direction_pgad,
          doc.max_direction_s1d,
          doc.max_direction_ssd,
          doc.percentile_pgad,
          doc.percentile_s1d,
          doc.percentile_ssd
        ]);
      });
    });
  });

  return promise;
});


/**
 * Insert region data.
 *
 * @return {Promise}
 *     promise representing that all region data has been inserted.
 */
insertData = insertRegions.then((regionIds) => {
  var promise;

  promise = Promise.resolve();

  regions.forEach((region) => {
    // run each region load in sequence
    promise = promise.then(() => {

      process.stderr.write('Loading ' + region.name + ' region data\n');

      return db.query('DROP TABLE IF EXISTS temp_region_data CASCADE').then(() => {
        // create temporary table for loading data
        return db.query(`
          CREATE TABLE temp_region_data (
            latitude NUMERIC NOT NULL,
            longitude NUMERIC NOT NULL,
            mapped_pgad NUMERIC NOT NULL,
            mapped_s1d NUMERIC NOT NULL,
            mapped_ssd NUMERIC NOT NULL
          )
        `);
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

          stream = db.query(copyFrom(`
              COPY temp_region_data
              (latitude, longitude, mapped_pgad, mapped_s1d, mapped_ssd)
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
        return db.query(`
          INSERT INTO data (
            region_id,
            latitude,
            longitude,
            mapped_pgad,
            mapped_s1d,
            mapped_ssd
          ) (
            SELECT
              $1,
              latitude,
              longitude,
              mapped_pgad,
              mapped_s1d,
              mapped_ssd
              FROM temp_region_data
          )
        `, [regionIds[region.name]]);
      }).then(() => {
        // remove temporary table
        return db.query('DROP TABLE temp_region_data CASCADE');
      });
    });
  });

  return promise;
});


// wait for data to finish loading
Promise.all([insertData, insertDocuments]).then(() => {
  process.stderr.write('Success!\n');
  process.exit(0);
}).catch((err) => {
  process.stderr.write('Error loading data\n');
  process.stderr.write(err.stack);
  process.exit(1);
});
