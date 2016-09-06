#!/usr/bin/env node
'use strict';

// This is a simple comand-line script for producing a configuration file
// for the application runtime.

process.chdir(__dirname);


var Configurer = require('./index'),
    configuration = require('./configuration'),
    questions = require('./questions');


var configurer = Configurer(configuration);


configurer.configure(questions)
.then((/*runtimeConfig*/) => {
  process.stdout.write('\nConfiguration complete. Results saved in ...\n');
  process.stdout.write(`  ${configuration.confFile}\n`);
}).catch((err) => {
  process.stderr.write(err + '\n');
  if (err.stack) {
    process.stderr.write(err.stack + '\n');
  }
  process.exit(-1);
});
