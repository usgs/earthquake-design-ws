'use strict';

process.stdout.write(process.cwd() + '\n');

var fs = require('fs'),
    pjson = require('../package.json');



// This file contains prompts the user is presented with when configuring this
// application. This should export an array of {Question} objects as defined
// by npm/inquirer. See: https://www.npmjs.com/package/inquirer#question

// Get app version info from packages.json
var REVISION,
    VERSION;

if (fs.existsSync(process.cwd() + '/../.REVISION')) {
  REVISION = fs.readFileSync(process.cwd() + '/../.REVISION');
} else {
  REVISION = 'Working Development';
}

VERSION = pjson.version;

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
  },
  {
    type: 'input',
    name: 'DB_SCHEMA_PROBABILISTIC',
    message: 'Database schema for probabilistic data',
    default: 'probabilistic'
  },
  {
    type: 'input',
    name: 'PROBABILISTIC_SERVICE_URL',
    message: 'Web service for fetching mapped probabilistic ground motion data',
    default: 'https://earthquake.usgs.gov/ws/designmaps/probabilistic.json'
  },
  {
    type: 'input',
    name: 'RISK_COEFFICIENT_SERVICE_URL',
    message: 'Web service for fetching mapped risk coefficent data',
    default: 'https://earthquake.usgs.gov/ws/designmaps/risk-coefficient.json'
  },
  {
    type: 'input',
    name: 'DETERMINISTIC_SERVICE_URL',
    message: 'Web service for fetching mapped deterministic ground motion data',
    default: 'https://earthquake.usgs.gov/ws/designmaps/deterministic.json'
  },
  {
    type: 'input',
    name: 'VERSION_INFO',
    message: 'Version Info for the release',
    default: VERSION
  },
  {
    type: 'input',
    name: 'REVISION_INFO',
    message: 'Git commit hash of working copy',
    default: REVISION
  }
];
