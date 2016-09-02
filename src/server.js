'use strict';

var extend = require('extend'),
    fs = require('fs'),
    HydraWebService = require('./WebService');


var config,
    configPath,
    service;


configPath = 'src/conf/config.json';

if (!fs.existsSync(configPath)) {
  process.stderr.write('Application configuration not found,' +
      ' run "node src/lib/pre-install"\n');
  process.exit(1);
}

config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// allow environment variables to override configuration, mostly for docker
config = extend(config, process.env);

service = HydraWebService(config);
service.start();
