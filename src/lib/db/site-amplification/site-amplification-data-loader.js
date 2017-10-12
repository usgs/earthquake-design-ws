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
   *
   *
   */
  _this.insertBins = function (lookupIds) {
    let promise;

    promise = Promise.resolve();

    for (let lookupId in lookupIds) {
      promise = promise.then(() => {
        let insertBins,
            siteAmplification;

        siteAmplification = lookupIds[lookupId];

        insertBins = function () {
          let queries = Promise.resolve();

          queries = queries.then(() => {
            return _this.db.query(`
              INSERT INTO bins (
                lookup_id,
                bin
              ) VALUES ($1, $2)
            `, [
              lookupId,
              siteAmplification.bins
            ]);
          });

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertBins();
        }

        return _this.db.query(`
          SELECT id,
            bin
          FROM bins
          WHERE lookup_id=$1
        `, [
          lookupId
        ]).then((result) => {
          if (result.rows.length == 0) {
            // bin does not exist
            return insertBins();
          }

          // found existing bin
          let skipInsertBin;

          lookupId = result.rows[0].id;

          skipInsertBin = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // bin already exists
            return skipInsertBin();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropBins',
                type: 'confirm',
                message: `Binned values for row ${lookupId} already exists, drop and reload bins`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropBins) {
                return _this.db.query(`
                  DELETE FROM bins
                  WHERE id=$1
                `, [lookupId]).then(() => {
                  return insertBins();
                });
              } else {
                return skipInsertBin();
              }
            });
          }
        });
      });
    }

    return promise;
  };

  /**
   *
   *
   */
  _this.insertLookup = function () {
    let promise,
        siteAmplificationData,
        lookupIds;

    // TODO: get existing siteAmplificationData and filter if only loading missing
    // but may need to pass all lookupIds for insertSiteClass
    siteAmplificationData = _this.siteAmplificationData;

    // load siteAmplificationData
    promise = Promise.resolve();

    lookupIds = {};
    for (let referenceDocument in siteAmplificationData) {
      for (let type in siteAmplificationData[referenceDocument]) {
        promise = promise.then(() => {
          let insertLookupRow;

          insertLookupRow = function () {
            return _this.db.query(`
              INSERT INTO lookup (
                reference_document,
                type
              ) VALUES ($1, $2)
              RETURNING id
            `, [
              referenceDocument,
              type
            ]).then((result) => {
              // save referenceDocument id for later data loading
              lookupIds[result.rows[0].id] =
                  siteAmplificationData[referenceDocument][type];
            });
          };

          if (_this.mode === MODE_SILENT) {
            return insertLookupRow();
          }

          return _this.db.query(`
            SELECT id
            FROM lookup
            WHERE reference_document=$1
            AND type=$2
          `, [referenceDocument, type]).then((result) => {
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
                  siteAmplificationData[referenceDocument][type];
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
                  message: `Site amplification data for ${referenceDocument} ${type} already exists, drop and reload site amplification data`,
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
   *
   *
   */
  _this.insertSiteClass = function (lookupIds) {
    let promise;

    promise = Promise.resolve();

    for (let lookupId in lookupIds) {
      promise = promise.then(() => {
        let insertSiteClass,
            siteAmplification;

        siteAmplification = lookupIds[lookupId];

        insertSiteClass = function () {
          let queries = Promise.resolve();

          for (let siteClass in siteAmplification.siteClasses) {
            queries = queries.then(() => {
              return _this.db.query(`
                INSERT INTO site_classes (
                  lookup_id,
                  site_class,
                  bin
                ) VALUES ($1, $2, $3)
              `, [
                lookupId,
                siteClass,
                siteAmplification.siteClasses[siteClass]
              ]);
            });
          }

          return queries;
        };

        if (_this.mode === MODE_SILENT) {
          return insertSiteClass();
        }

        return _this.db.query(`
          SELECT id,
            site_class
          FROM site_classes
          WHERE lookup_id=$1
        `, [
          lookupId
        ]).then((result) => {
          if (result.rows.length == 0) {
            // siteClass does not exist
            return insertSiteClass();
          }

          // found existing siteClass
          let siteClass,
              skipInsertSiteClass;

          lookupId = result.rows[0].id;
          siteClass = result.rows[0].site_class;
          skipInsertSiteClass = function () {
            // nothing to do here
          };

          if (_this.mode === MODE_MISSING) {
            // siteClass already exists
            return skipInsertSiteClass();
          } else {
            // ask user whether to remove existing data
            let prompt = inquirer.createPromptModule();
            return prompt([
              {
                name: 'dropSiteClass',
                type: 'confirm',
                message: `Site class ${siteClass} already exists, drop and reload site class`,
                default: false
              }
            ]).then((answers) => {
              if (answers.dropSiteClass) {
                return _this.db.query(`
                  DELETE FROM site_classes
                  WHERE id=$1
                `, [lookupId]).then(() => {
                  return insertSiteClass();
                });
              } else {
                return skipInsertSiteClass();
              }
            });
          }
        });
      });
    }

    return promise;
  };

  /**
   *
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
                    site_class_limit,
                    site_class_limit_message
                  ) VALUES ($1, $2, $3, $4)
                `, [
                  lookupId,
                  siteClass,
                  restriction.limit,
                  restriction.message
                ]);
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
        ]).then((result) => {
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
        _this.insertSiteClass(lookupIds),
        _this.insertRestriction(lookupIds),
        _this.insertBins(lookupIds)
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
