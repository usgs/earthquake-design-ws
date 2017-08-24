'use strict';


var Config = require('./lib/util/config'),
    fs = require('fs'),
    https = require('https'),
    WebService = require('./lib/web-service');


var ca,
    config,
    service;

config = Config().get();


if (config.SSL_CERT_FILE) {
  ca = fs.readFileSync(config.SSL_CERT_FILE, 'utf-8');
  ca = ca.split('-----END CERTIFICATE-----').map((c) => {
    return c + '-----END CERTIFICATE-----';
  });

  https.globalAgent.options.ca = ca;
}

service = WebService(config);
service.start();
