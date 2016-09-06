'use strict';


var Cli = require('./cli'),
    extend = require('extend'),
    fs = require('fs'),
    path = require('path');


var _DEFAULTS,
    _PROMPT_USE_EXISTING_CONFIG;

_DEFAULTS = {
  confFile: path.resolve(__dirname + '/../conf/config.json')
};

_PROMPT_USE_EXISTING_CONFIG = {
  type: 'confirm',
  name: 'useExisting',
  message: 'Existing configuration found. Use this as defaults?',
  default: true
};


/**
 * A class used to generate a configuration file on the command line. Extends
 * the CLI class.
 *
 * @param options {Object}
 *      Configuration options for this class. See `_initialize` for details.
 */
var Configurer = function (options) {
  var _this,
      _initialize;


  _this = Cli(options);

  /**
   * Constructor. Instantiates a new instance of a {Configurer} class.
   *
   * @param options.configFile {String}
   *     A path to where the generated configuration should be stored.
   */
  _initialize = function (options) {
    _this.options = extend(true, {}, _DEFAULTS, options);
  };


  /**
   * Runs the configuration process. The generated configuration is written
   * to the configured `_this.options.confFile`.
   *
   * @param prompts {Array}
   *     An array of {Question} objects as defined by inquirer.
   *
   * @return {Promise}
   *     A promise that resolves with the generated configuration.
   */
  _this.configure = function (prompts) {
    return _this.getExistingConfig(_this.options.confFile)
      .then((existingConfig) => {
        if (existingConfig) {
          return _this.updateQuestionDefaults(prompts, existingConfig);
        } else {
          return prompts;
        }
      }).then((questions) => {
        return _this.prompt(questions);
      }).then((configuration) => {
        // Extend app/install configuration with runtime configuration
        return extend({}, _this.options, configuration);
      }).then((configuration) => {
        return _this.saveOutput(configuration);
      });
  };

  /**
   * Checks if the indicated `existingConfig` already exists in the file system.
   * If it does, prompts the user as to whether the information stored in that
   * file should be used as the default configuration parameters for this
   * configuration.
   *
   * This method is called from the "configure" method is is not typically
   * invoked directly.
   *
   *
   * @param existingConfig {String}
   *     The path to where existing configuration might be found.
   *
   * @return {Promise}
   *      A promise that will reject if an error occurs or resolve with:
   *        (a) The configuration object from the `existingConfig` if such a
   *            file existed _and_ the user chose to use that configuration as
   *            defaults.
   *        (b) Undefined otherwise.
   */
  _this.getExistingConfig = function (existingConfig) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(existingConfig)) {
        resolve();
      } else {
        _this.prompt([_PROMPT_USE_EXISTING_CONFIG]).then((answer) => {
          if (answer.useExisting) {
            try {
              resolve(JSON.parse(fs.readFileSync(existingConfig)));
            } catch (err) {
              reject(err);
            }
          } else {
            resolve();
          }
        });
      }
    });
  };

  /**
   * Writes the given `configuration` to the configured `_this.options.confFile`
   *
   * @param configuration {Object}
   *     The configuration to save.
   *
   * @return {Promise}
   *     A promise that resolves with the saved configuration or rejects
   *     with an error if one occurs.
   */
  _this.saveOutput = function (configuration) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(_this.options.confFile,
            JSON.stringify(configuration, null, 2));
        resolve(configuration);
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Updates the default answer for each question when a corresponding answer
   * is provided in the givne `defaultAnswers`. This is used when the user
   * chooses to "use existing configuration as defaults" during the
   * configuration process.
   *
   * @param questions {Array}
   *     An array of {Question} objects as defined by inquirer.
   * @param defaultAnswers {Object}
   *     An object containing new default answers to use for each question.
   *
   * @return {Promise}
   *     A promise that resolves with the updated questions with new
   *     default answers.
   */
  _this.updateQuestionDefaults = function (questions, defaultAnswers) {
    return new Promise((resolve/*, reject*/) => {
      var updatedQuestions;

      try {
        updatedQuestions = JSON.parse(JSON.stringify(questions));

        // Update question defaults based on `defaultAnswers`
        updatedQuestions.forEach((question) => {
          if (question.name in defaultAnswers) {
            question.default = defaultAnswers[question.name];
          }
        });
      } catch (err) {
        // revert to defaults on error
        process.stderr.write('Failed to parse existing configuration. ' +
            'Reverting to defaults.\n');
        updatedQuestions = JSON.parse(JSON.stringify(questions));
      }

      resolve(updatedQuestions);
    });
  };


  _initialize(options);
  options = null;
  return _this;
};

module.exports = Configurer;
