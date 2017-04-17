'use strict';

var mocha = require('mocha'),
    util = require('util');

var GHReporter = function (runner) {
  mocha.reporters.Base.call(this, runner);

  // var self = this;
  var indents = 0;
  // var n = 0;


  function header () {
    return Array(indents+1).join('#');
  }

  function pending () {
    return ':dash:';
  }

  function pass () {
    return ':sparkles:';
  }

  function fail () {
    return ':boom:';
  }

  function write () {
    var message;

    message = util.format.apply(null, arguments);
    process.stdout.write(message + '\n');
  }

  runner.on('start', function () {
    write();
    write('#Quality Control Tests');
    write(`> Generated: ${runner.stats.start.toUTCString()}`);
    write();
  });

  runner.on('suite', function (suite) {
    ++indents;
    write(header(), suite.title);
  });

  runner.on('suite end', function () {
    --indents;
    if (indents === 1) {
      write();
    }
  });

  runner.on('pending', function (test) {
    write('- ' + pending() + '`%s`', test.title);
  });

  runner.on('pass', function (test) {
    if (test.speed === 'fast') {
      write('- ' + pass() + '`%s`', test.title);
    } else {
      write('- ' + pass() + '`%s`\n  - :snail: (%dms)',
          test.title, test.duration);
    }
  });

  runner.on('fail', function (test) {
    // write(header() + ' ' + fail() + ' (%d)\n```\n%s\n```\n', ++n, test.title);
    write('- ' +  fail() + '`%s`', test.title);
  });

  // runner.on('end', self.epilogue.bind(self));
};


module.exports = GHReporter;
