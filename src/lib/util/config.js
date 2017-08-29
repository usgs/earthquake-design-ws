'use strict';


var extend = require('extend'),
    fs = require('fs'),
    packageJson = require('../../../package.json'),
    questions = require('../../../configurer/questions');


var _DEFAULTS;

_DEFAULTS = {
  configFile: 'src/conf/config.json',
  revisionFile: '.REVISION',
  overrides: {}
};

/**
 * Class: Config
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
var Config = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor
   *
   * Initializes a new instance of Config.
   */
  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.config = _this.backportParams(extend({}, // <-- Least priority
      _this.getDefaults(questions),
      _this.getConfigFromFile(options.configFile),
      _this.getSupplemental(options),
      process.env, // Override from environment
      options.overrides // Override anything as desired at runtime
      // ^^ Most Priority
    ));
  };

  _this.backportParams = function (object) {
    var map;

    map = {
      'database': 'DB_HOST',
      'pgsql_read_only_user': 'DB_USER',
      'pgsql_read_only_password': 'DB_PASSWORD'
    };

    Object.keys(map).forEach((oldKey) => {
      var newKey;

      newKey = map[oldKey];

      if (object.hasOwnProperty(oldKey)) {
        object[newKey] = object[oldKey];
        delete object[oldKey];
      }
    });

    return object;
  };

  _this.extend = function (obj) {
    if (typeof obj === 'object') {
      _this.config = extend(_this.config, obj || {});
    } else {
      throw new Error('Invalid argument. `obj` must be an Object.');
    }
  };

  _this.get = function (param) {
    if (typeof param === 'undefined') {
      return _this.config;
    } else {
      return _this.config[param];
    }
  };

  _this.getConfigFromFile = function (configFile) {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    } else {
      process.stderr.write('Application configuration not found, ' +
          'recommend running "node configurer/configure.js"\n');
      return {};
    }
  };

  _this.getDefaults = function (defaults) {
    var obj;

    obj = {};
    defaults = defaults || [];

    defaults.forEach((def) => {
      if (def.hasOwnProperty('default')) {
        obj[def.name] = def.default;
      }
    });

    return obj;
  };

  _this.getSupplemental = function (options) {
    var obj;

    obj = {};

    if (packageJson && packageJson.hasOwnProperty('version')) {
      obj.VERSION = packageJson.version;
    } else {
      process.stderr.write('No package.json available for version info.');
      obj.VERSION = 'Working Development';
    }

    if (options.revisionFile && fs.existsSync(options.revisionFile)) {
      obj.REVISION = fs.readFileSync(options.revisionFile, 'utf-8');
    } else {
      obj.REVISION = 'Working Development';
    }

    obj.webDir = require('path').normalize(__dirname + '/../../htdocs');

    return obj;
  };

  _this.set = function (key, value) {
    _this.config[key] = value;
  };

  _this.unset = function (key) {
    delete _this.config[key];
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Config;
