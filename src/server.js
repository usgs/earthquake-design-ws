'use strict';

var extend = require('extend'),
    fs = require('fs'),
    WebService = require('./lib/web-service');


var config,
    configPath,
    service;


configPath = 'src/conf/config.json';

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} else {
  process.stderr.write('Application configuration not found,' +
      ' recommend running "node configurer/configure.js"\n');

  config = {
    MOUNT_PATH: '',
    PORT: 8000,
    LEGACY_URL: '/legacy/service'
  };
}

config = extend(config, process.env);

// Override generic configuration properties with site-specific properties
// as applicable.
if (config.hasOwnProperty('database')) {
  config.DB_HOST = config.database;
}

if (config.hasOwnProperty('pgsql_read_only_user')) {
  config.DB_USER = config.pgsql_read_only_user;
}

if (config.hasOwnProperty('pgsql_read_only_password')) {
  config.DB_PASSWORD = config.pgsql_read_only_password;
}


service = WebService(config);
service.start();
