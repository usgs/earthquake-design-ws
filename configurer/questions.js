'use strict';

// This file contains prompts the user is presented with when configuring this
// application. This should export an array of {Question} objects as defined
// by npm/inquirer. See: https://www.npmjs.com/package/inquirer#question

module.exports = [
  {
    type: 'input',
    name: 'MOUNT_PATH',
    message: 'Application mount path',
    default: ''
  },
  {
    type: 'input',
    name: 'PORT',
    message: 'Application port',
    default: '8000'
  },
  {
    type: 'input',
    name: 'LEGACY_URL',
    message: 'Legacy web service endpoint',
    default: 'https://earthquake.usgs.gov/designmaps/beta/us/service'
  },
  {
    type: 'input',
    name: 'DB_HOST',
    message: 'Database hostname',
    default: 'localhost'
  },
  {
    type: 'input',
    name: 'DB_PORT',
    message: 'Database port number',
    default: '5432'
  },
  {
    type: 'input',
    name: 'DB_DATABASE',
    message: 'Database name',
    default: 'usdesign'
  },
  {
    type: 'input',
    name: 'DB_USER',
    message: 'Database read-only user name'
  },
  {
    type: 'password',
    name: 'DB_PASSWORD',
    message: 'Database password'
  },
  {
    type: 'input',
    name: 'DB_SCHEMA_DETERMINISTIC',
    message: 'Database schema for deterministic data',
    default: 'deterministic'
  },
  {
    type: 'input',
    name: 'DB_SCHEMA_RISK_COEFFICIENT',
    message: 'Database schema for risk coefficient data',
    default: 'risk_coefficient'
  }
];
