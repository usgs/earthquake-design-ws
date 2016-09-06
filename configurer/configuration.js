'use strict';


// This is a static configuration file used to set up the install/configuration
// environment. Parameters set in this file may be app-specific, but should
// not be installation specific.


var path = require('path');


var _APP_DIR,
    _CONF_DIR,
    _LIB_DIR,
    _SRC_DIR,
    _WEB_DIR;

_APP_DIR = path.normalize(__dirname + '/..');
_SRC_DIR = _APP_DIR + '/src';
_CONF_DIR = _SRC_DIR + '/conf';
_LIB_DIR = _SRC_DIR + '/lib';
_WEB_DIR = _SRC_DIR + '/htdocs';


module.exports = {
  appDir: _APP_DIR,
  confDir: _CONF_DIR,
  confFile: `${_CONF_DIR}/config.json`,
  libDir: _LIB_DIR,
  nonInteractive: process.env.NON_INTERACTIVE === 'true',
  srcDir: _SRC_DIR,
  webDir: _WEB_DIR
};
