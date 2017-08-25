'use strict';


var fs = require('fs'),
    https = require('https'),
    WebService = require('./lib/web-service');


var ca,
    config,
    service;

config = require('./lib/util/config')().get();

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
