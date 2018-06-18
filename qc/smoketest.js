'use strict';


const QCRunner = require('./qc-runner.js');


let baseurl,
    qcRunner;

qcRunner = QCRunner();
baseurl = process.argv[2];
if (typeof baseurl === 'undefined') {
  baseurl = 'http://localhost:8000';
  process.stderr.write(`No base url specified, using default ${baseurl}\n`);
}


Promise.all([
  qcRunner.run(`${baseurl}/ws/designmaps/aashto-2009.json`,
      require('./expectations/aashto-2009.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/asce7-05.json`,
      require('./expectations/asce7-05.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/asce7-10.json`,
      require('./expectations/asce7-10.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/asce7-16.json`,
      require('./expectations/asce7-16.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/asce41-13.json`,
      require('./expectations/asce41-13.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/nehrp-2009.json`,
      require('./expectations/nehrp-2009.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/nehrp-2015.json`,
      require('./expectations/nehrp-2015.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/ibc-2012.json`,
      require('./expectations/ibc-2012.smoketest.json'),
      process.stdout),

  qcRunner.run(`${baseurl}/ws/designmaps/ibc-2015.json`,
      require('./expectations/ibc-2015.smoketest.json'),
      process.stdout)

]).then((results) => {
  let status;

  status = 0;

  results.forEach((result) => {
    process.stdout.write(JSON.stringify(result) + '\n');
    status += result.fail;
  });

  process.stdout.write('\n');
  process.exit(status);
}).catch((err) => {
  if (err.stack) {
    process.stderr.write('' + err.stack);
  }
  process.exit(-1);
});
