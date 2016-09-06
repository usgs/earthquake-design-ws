'use strict';


var extend = require('extend'),
    inquirer = require('inquirer');


var _DEFAULTS;

_DEFAULTS = {
  nonInteractive: false
};

/**
 * Base class for command line utilities.
 *
 * @param options {Object}
 *     Configuration options. See #_initialize for details.
 */
var Cli = function (options) {
  var _this,
      _initialize;


  _this = {};

  /**
   * Constructor.
   *
   * @param options.nonInteractive {Boolean}
   *     Flag indicating whether configuration should proceed interactively
   *     (`false`) or not (`true`).
   */
  _initialize = function (options) {
    _this.options = extend(true, {}, _DEFAULTS, options);
  };


  /**
   * Resolves the `questions` by accepting the default answers for each. This
   * is used when running in non-interactive mode in order to fake responses.
   *
   * @param questions {Array}
   *     An array of {Question} objects as defined by inquirer.
   *
   * @return {Promise}
   *     A promise that resolves with an {Object} containing keys for
   *     each question name whose values will be the question default answer
   *     or `null` if no default is specified.
   */
  _this.getDefaultAnswers = function (questions) {
    return new Promise((resolve, reject) => {
      var answers;

      try {
        answers = {};
        questions.forEach((question) => {
          answers[question.name] = ('default' in question) ?
              question.default : null;
        });
      } catch (err) {
        reject(err);
      }

      resolve(answers);
    });
  };

  /**
   * Prompts for answers to each question. If non-interactive, calls
   * `getDefaultAnswers` instead.
   *
   * @param questions {Array}
   *     An array of {Question} objects as defined by inquirer.
   *
   * @return {Promise}
   *     A promise that resolves with an {Object} containing keys for
   *     each question name with corresponding answers.
   */
  _this.prompt = function (questions) {
    if (_this.options.nonInteractive) {
      return _this.getDefaultAnswers(questions);
    } else {
      return inquirer.prompt(questions);
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = Cli;
