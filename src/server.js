'use strict';

var extend = require('extend'),
    fs = require('fs'),
    https = require('https'),
    WebService = require('./lib/web-service');


var ca,
    config,
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

// Config custom certificate chain
if (config.SSL_CERT_FILE) {
  ca = fs.readFileSync(config.SSL_CERT_FILE, 'utf-8');
  ca = ca.split('-----END CERTIFICATE-----').map((c) => {
    return c + '-----END CERTIFICATE-----';
  });
  https.globalAgent.options.ca = ca;
}

service = WebService(config);
service.start();
