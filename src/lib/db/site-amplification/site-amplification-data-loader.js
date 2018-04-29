'use strict';


const AbstractDataLoader = require('../abstract-data-loader'),
    Config = require('../../util/config'),
    extend = require('extend'),
    inquirer = require('inquirer');


let config = Config().get(),
    siteAmplificationData = require('./site-amplification.json');

//const MODE_INTERACTIVE = 'interactive';
const MODE_MISSING = 'missing';
const MODE_SILENT = 'silent';
const _DEFAULTS = {
  db: null,
  mode: AbstractDataLoader.MODE_MISSING,
  schemaFile: __dirname + '/./schema.sql',
  schemaName: config.DB_SCHEMA_SITE_AMPLIFICATION,
  schemaUser: config.DB_USER,
  siteAmplificationData: siteAmplificationData
};

const SiteAmplificationDataLoader = function(options) {
  let _this;

  options = extend({}, _DEFAULTS, options);
  _this = AbstractDataLoader(options);
  _this.siteAmplificationData = options.siteAmplificationData;


  /**
   * Insert ground motion level bins into the database
   *
   * @param lookupIds {Object}
   *     An object with ground motion level data keyed by the primary key
   *     (lookup.id) from the lookup table.
   *
   */
  _this.insertGroundMotionLevel = function (lookupIds) {
    let promise;

    promise = Promise.resolve();

    for (let lookupId in lookupIds) {
      promise = promise.then(() => {
        let insertGroundMotionLevel,
            siteAmplification;

        siteAmplification = lookupIds[lookupId];

        insertGroundMotionLevel = function () {
          let queries = Promise.resolve();

          queries = queries.then(() => {
            return _this.db.query(`
              INSERT INTO ground_motion_level (
                lookup_id,
                value
              ) VALUES ($1, $2)
            `, [
                  lookupId,
                  siteAmplification.bins
                ]
            );
          });

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertGroundMotionLevel();
        }

        return _this.db.query(`
          SELECT id,
            value
          FROM ground_motion_level
          WHERE lookup_id=$1
        `, [
              lookupId
            ]
        ).then((result) => {
          if (result.rows.length == 0) {
            // bin does not exist
            return insertGroundMotionLevel();
          }

          // found existing bin
          let skipInsertGroundMotionLevel;

          lookupId = result.rows[0].id;

          skipInsertGroundMotionLevel = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // bin already exists
            return skipInsertGroundMotionLevel();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropGroundMotionLevel',
                type: 'confirm',
                message: `Binned values for row ${lookupId} already exists, drop and reload bins`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropGroundMotionLevel) {
                return _this.db.query(`
                  DELETE FROM ground_motion_level
                  WHERE id=$1
                `, [lookupId]).then(() => {
                  return insertGroundMotionLevel();
                });
              } else {
                return skipInsertGroundMotionLevel();
              }
            });
          }
        });
      });
    }

    return promise;
  };

  /**
   * Insert lookup data into bridge table, unique combination of
   * "reference_document" and "spectral_period"
   *
   */
  _this.insertLookup = function () {
    let promise,
        siteAmplificationData,
        lookupIds;

    // TODO: get existing siteAmplificationData and filter if only loading missing
    // but may need to pass all lookupIds for insertLookup
    siteAmplificationData = _this.siteAmplificationData;

    // load siteAmplificationData
    promise = Promise.resolve();

    lookupIds = {};
    for (let referenceDocument in siteAmplificationData) {
      for (let spectral_period in siteAmplificationData[referenceDocument]) {
        promise = promise.then(() => {
          let insertLookupRow;

          insertLookupRow = function () {
            return _this.db.query(`
              INSERT INTO lookup (
                reference_document,
                spectral_period
              ) VALUES ($1, $2)
              RETURNING id
            `, [
                  referenceDocument,
                  spectral_period
                ]
            ).then((result) => {
              // save referenceDocument id for later data loading
              lookupIds[result.rows[0].id] =
                  siteAmplificationData[referenceDocument][spectral_period];
            });
          };

          if (_this.mode === MODE_SILENT) {
            return insertLookupRow();
          }

          return _this.db.query(`
            SELECT id
            FROM lookup
            WHERE reference_document=$1
            AND spectral_period=$2
          `, [referenceDocument, spectral_period]).then((result) => {
            if (result.rows.length == 0) {
              // lookupRow not found
              return insertLookupRow();
            }

            // found existing lookupRow
            let lookupId,
                skipInsertLookup;

            lookupId = result.rows[0].id;
            skipInsertLookup = function () {
              // save lookup id for later data loading
              lookupIds[result.rows[0].id] =
                  siteAmplificationData[referenceDocument][spectral_period];
            };

            if (_this.mode === MODE_MISSING) {
              // lookup id already exists
              return skipInsertLookup();
            } else {
              // ask user whether to remove existing data
              let prompt = inquirer.createPromptModule();
              return prompt([
                {
                  name: 'dropLookup',
                  type: 'confirm',
                  message: `Site amplification data for ${referenceDocument} ${spectral_period} already exists, drop and reload site amplification data`,
                  default: false
                }
              ]).then((answers) => {
                if (answers.dropLookup) {
                  return _this.db.query(`
                    DELETE FROM lookup
                    WHERE id=$1
                  `, [lookupId]).then(() => {
                    return insertLookupRow();
                  });
                } else {
                  return skipInsertLookup();
                }
              });
            }
          });
        });
      }
    }

    return promise.then(() => {
      // all siteAmplificationData inserted, and IDs should be set
      return lookupIds;
    });
  };

  /**
   * Insert site amplification factor bins into the database
   *
   * @param lookupIds {Object}
   *     An object with ground motion level data keyed by the primary key
   *     (lookup.id) from the lookup table.
   *
   */
  _this.insertAmplicationFactor = function (lookupIds) {
    let promise;

    promise = Promise.resolve();

    for (let lookupId in lookupIds) {
      promise = promise.then(() => {
        let insertAmplicationFactor,
            siteAmplification;

        siteAmplification = lookupIds[lookupId];

        insertAmplicationFactor = function () {
          let queries = Promise.resolve();

          for (let siteClass in siteAmplification.siteClasses) {
            queries = queries.then(() => {
              return _this.db.query(`
                INSERT INTO amplification_factor (
                  lookup_id,
                  site_class,
                  value
                ) VALUES ($1, $2, $3)
              `, [
                    lookupId,
                    siteClass,
                    siteAmplification.siteClasses[siteClass]
                  ]
              );
            });
          }

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertAmplicationFactor();
        }

        return _this.db.query(`
          SELECT id,
            site_class
          FROM amplification_factor
          WHERE lookup_id=$1
        `, [
              lookupId
            ]
        ).then((result) => {
          if (result.rows.length == 0) {
            // siteClass does not exist
            return insertAmplicationFactor();
          }

          // found existing siteClass
          let siteClass,
              skipinsertAmplicationFactor;

          lookupId = result.rows[0].id;
          siteClass = result.rows[0].site_class;
          skipinsertAmplicationFactor = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // siteClass already exists
            return skipinsertAmplicationFactor();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropAmplificationFactor',
                type: 'confirm',
                message: `Site class ${siteClass} already exists, drop and reload site class`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropAmplificationFactor) {
                return _this.db.query(`
                  DELETE FROM amplification_factor
                  WHERE id=$1
                `, [lookupId]).then(() => {
                  return insertAmplicationFactor();
                });
              } else {
                return skipinsertAmplicationFactor();
              }
            });
          }
        });
      });
    }

    return promise;
  };

  /**
   * Insert site amplification restriction data into the database
   *
   * @param lookupIds {Object}
   *     An object with ground motion level data keyed by the primary key
   *     (lookup.id) from the lookup table.
   *
   */
  _this.insertRestriction = function (lookupIds) {
    let promise;

    promise = Promise.resolve();

    for (let lookupId in lookupIds) {
      promise = promise.then(() => {
        let insertRestriction,
            siteAmplification;

        siteAmplification = lookupIds[lookupId];

        insertRestriction = function () {
          let queries = Promise.resolve();

          for (let siteClass in siteAmplification.restriction) {
            let restriction;

            restriction = siteAmplification.restriction[siteClass];

            if (restriction !== null) {
              queries = queries.then(() => {
                return _this.db.query(`
                  INSERT INTO restriction (
                    lookup_id,
                    site_class,
                    "limit",
                    message
                  ) VALUES ($1, $2, $3, $4)
                `, [
                      lookupId,
                      siteClass,
                      restriction.limit,
                      restriction.message
                    ]
                );
              });
            }
          }

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertRestriction();
        }

        return _this.db.query(`
          SELECT id,
            site_class
          FROM restriction
          WHERE lookup_id=$1
        `, [
              lookupId
            ]
        ).then((result) => {
          if (result.rows.length == 0) {
            // restriction does not exist
            return insertRestriction();
          }

          // found existing restriction
          let siteClass,
              skipInsertRestriction;

          lookupId = result.rows[0].id;
          siteClass = result.rows[0].site_class;
          skipInsertRestriction = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // restriction already exists
            return skipInsertRestriction();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropRestriction',
                type: 'confirm',
                message: `Restriction for site class ${siteClass} already exists, drop and reload restriction`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropRestriction) {
                return _this.db.query(`
                  DELETE FROM restriction
                  WHERE id=$1
                `, [lookupId]).then(() => {
                  return insertRestriction();
                });
              } else {
                return skipInsertRestriction();
              }
            });
          }
        });
      });
    }

    return promise;
  };


  /**
   * Run data loader using configured options.
   *
   * @return {Promise}
   *     promise representing that all data has been loaded.
   */
  _this.run = function () {
    let createSchema,
        insertLookup,
        insertData;

    // set order of load operations
    createSchema = _this._createSchema();
    insertLookup = createSchema.then(_this.insertLookup);
    insertData = insertLookup.then((lookupIds) => {
      return Promise.all([
        _this.insertAmplicationFactor(lookupIds),
        _this.insertRestriction(lookupIds),
        _this.insertGroundMotionLevel(lookupIds)
      ]);
    }).catch((err) => {
      process.stderr.write('handleing error' + err.stack);
    });

    return insertData;
  };


  options = null;
  return _this;
};


module.exports = SiteAmplificationDataLoader;
