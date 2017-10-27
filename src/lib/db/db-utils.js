'use strict';


var fs = require('fs'),
    inquirer = require('inquirer'),
    pg = require('pg');


var DbUtils = {

  /**
   * Create a schema.
   *
   * Additionally sets search_path to schema.
   *
   * @param options {Object}
   * @param options.db {pg.DB}
   *     database connection with admin privileges.
   * @param options.file {String}
   *     file containing create table and create index definitions.
   * @param options.name {String}
   *     name of schema.
   * @param options.user {String}
   *     user to be granted select access.
   */
  'createSchema': function (options) {
    var db,
        file,
        name,
        user;

    db = options.db;
    file = options.file;
    name = options.name;
    user = options.user;

    return DbUtils.readSqlFile(file).then((sql) => {
      sql = [
        'DROP SCHEMA IF EXISTS ' + name + ' CASCADE',
        'CREATE SCHEMA ' + name + ' AUTHORIZATION ' + user,
        'SET search_path TO ' + name
      ].concat(sql).concat([
        'GRANT SELECT ON ALL TABLES IN SCHEMA ' + name + ' TO ' + user
      ]);

      return DbUtils.exec(db, sql);
    });
  },

  /**
   * Execute a list of statements.
   *
   * No data is returned from this function.
   *
   * @param db {pg.DB}
   *     database to execute statements.
   * @param statements {Array<String>}
   *     statements to execute.
   * @return {Promise}
   *     promise representing execution of statements.
   */
  'exec': function (db, statements) {
    return Promise.resolve().then(() => {
      var promise;

      promise = Promise.resolve();
      statements.forEach((s) => {
        if (!s) {
          // ignore empty statements
          return;
        }
        promise = promise.then(() => {
          return db.query(s);
        });
      });
      return promise;
    });
  },

  /**
   * Get an admin connection to a database.
   *
   * @return {Promise<pg.DB>}
   *     promise that resolves to database connection.
   */
  'getAdminDb': function (config) {

    config = config || {};

    process.stderr.write('Enter admin database connection information\n');
    return inquirer.prompt([
      {
        type: 'input',
        name: 'DB_HOST',
        message: 'Database hostname',
        default: config.DB_HOST
      },
      {
        type: 'input',
        name: 'DB_PORT',
        message: 'Database port number',
        default: config.DB_PORT
      },
      {
        type: 'input',
        name: 'DB_DATABASE',
        message: 'Database name',
        default: config.DB_DATABASE
      },
      {
        type: 'input',
        name: 'DB_USER',
        message: 'Database admin user name'
      },
      {
        type: 'password',
        name: 'DB_PASSWORD',
        message: 'Database admin password'
      }
    ]).then((dbConfig) => {
      return new Promise((resolve, reject) => {
        var db;

        db = new pg.Client({
          database: dbConfig.DB_DATABASE,
          host: dbConfig.DB_HOST,
          password: dbConfig.DB_PASSWORD,
          port: dbConfig.DB_PORT,
          user: dbConfig.DB_USER
        });

        db.connect((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      });
    });
  },

  /**
   * Use the default config values in creation of a database
   * connection to the database for silent data loading
   * operations.
   */
  'getNonInteractiveAdminDB': function (config) {

    config = config || {};

    return new Promise((resolve, reject) => {
      let db;

      db = new pg.Client({
        database: config.DB_DATABASE,
        host:     process.env.DB_ADMIN_HOST     || config.DB_HOST,
        password: process.env.DB_ADMIN_PASSWORD || config.DB_PASSWORD,
        port:     process.env.DB_ADMIN_PORT     || config.DB_PORT,
        user:     process.env.DB_ADMIN_USER     || config.DB_USER
      });

      db.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  },

  /**
   * Read a file containing SQL statements.
   *
   * Statements should be terminated with a semi-colon.
   *
   * @param file {String}
   *     file containing sql statements.
   * @return {Promise<Array<String>>}
   *     promise that resolves to an array of SQL statements.
   */
  'readSqlFile': function (file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).then((data) => {
      var sql;

      // TODO: something better than split?
      sql = ('' + data).split(';');

      return sql.map((s) => {
        return s.trim();
      });
    });
  }

};


module.exports = DbUtils;
