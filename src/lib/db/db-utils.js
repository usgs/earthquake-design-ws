'use strict';


var config = require('../../conf/config.json'),
    inquirer = require('inquirer'),
    pg = require('pg');


var DbUtils = {
  'getAdminDb': function () {
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
      return new pg.Client(dbConfig);
    });
  }

};


module.exports = DbUtils;
