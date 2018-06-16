'use strict';


const QCRunner = require('./qc-runner.js');


let qcRunner;

qcRunner = QCRunner();


Promise.all([
  qcRunner.run('http://localhost:8000/ws/designmaps/aashto-2009.json',
      require('./expectations/aashto-2009.expectation.json'),
      './results/aashto-2009.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/asce7-05.json',
      require('./expectations/asce7-05.expectation.json'),
      './results/asce7-05.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/asce7-10.json',
      require('./expectations/asce7-10.expectation.json'),
      './results/asce7-10.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/asce7-16.json',
      require('./expectations/asce7-16.expectation.json'),
      './results/asce7-16.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/asce41-13.json',
      require('./expectations/asce41-13.expectation.json'),
      './results/asce41-13.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/nehrp-2009.json',
      require('./expectations/nehrp-2009.expectation.json'),
      './results/nehrp-2009.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/nehrp-2015.json',
      require('./expectations/nehrp-2015.expectation.json'),
      './results/nehrp-2015.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/ibc-2012.json',
      require('./expectations/ibc-2012.expectation.json'),
      './results/ibc-2012.qc.md'),

  qcRunner.run('http://localhost:8000/ws/designmaps/ibc-2015.json',
      require('./expectations/ibc-2015.expectation.json'),
      './results/ibc-2015.qc.md')
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
