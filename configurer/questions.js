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
  }
];
