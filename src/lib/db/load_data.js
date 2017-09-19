'use strict';

const readline = require('readline'),
    execSh = require('exec-sh');

// inquirer


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

let startMark = 0,
    endMark = 0;


const DataLoader = {

  startTiming: (() => {
    startMark = new Date();
  }),

  stopTiming: (() => {
    endMark = new Date();
    DataLoader.getTimeMetricsMinutes();
  }),

  getTimeMetricsMinutes: (() => {
    let tm = ' seconds';
    let roundedSecs = Math.round( ((endMark - startMark)/1000), 0);
    if (roundedSecs > 60) {
      roundedSecs = roundedSecs / 60;
      tm = ' minutes';
    }
    process.stdout.write('Finished in ' + roundedSecs + tm);
  }),

  printMenu: (() => {
    process.stdout.write('\r\nPlease select one of the following options:\r\n\r\n');
    process.stdout.write('\r\n1 - Fully Load All Data Sets');
    process.stdout.write('\r\n2 - Incrementally Load All Data Sets');
    process.stdout.write('\r\n-------------------------------------------');
    process.stdout.write('\r\n3 - Fully Load Deterministic Data Set');
    process.stdout.write('\r\n4 - Fully Load Probabilistic Data Set');
    process.stdout.write('\r\n5 - Fully Load Risk Coefficient Data Set');
    process.stdout.write('\r\n6 - Fully Load T-Sub-L Data Set');
    process.stdout.write('\r\n-------------------------------------------');
    process.stdout.write('\r\n7 - Incrementally Load Deterministic Data Set');
    process.stdout.write('\r\n8 - Incrementally Load Probabilistic Data Set');
    process.stdout.write('\r\n9 - Incrementally Load Risk Coefficient Data Set');
    process.stdout.write('\r\n10 - Incrementally Load T-Sub-L Data Set');
    process.stdout.write('\r\n-------------------------------------------');
    process.stdout.write('\r\n11 - Exit');
    process.stdout.write('\r\n');
  }),

  fullyLoadDeterministicData: (() => {
    process.stdout.write('   loading deterministic data...');
    const promise = new Promise(function(resolve, reject) {
      execSh('node ./src/lib/db/deterministic/load_deterministic.js', null,
          function(err, stdout, stderr) {
            if (err || stderr) {
              reject(Error(err + stderr));
            } else {
              resolve(stdout);
            }
          }
      );
    });
    return promise;
  }),

  fullyLoadProbabilisticData: (() => {
    process.stdout.write('   loading probabilistic data...');
    const promise = new Promise(function(resolve, reject) {
      execSh('node ./src/lib/db/probabilistic/load_probabilistic.js', null,
          function(err, stdout, stderr) {
            if (err || stderr) {
              reject(Error(err + stderr));
            } else {
              resolve(stdout);
            }
          }
      );
    });
    return promise;
  }),

  fullyLoadRiskCoefficientData: (() => {
    process.stdout.write('   loading risk coefficient data...');
    const promise = new Promise(function(resolve, reject) {
      execSh('node ./src/lib/db/risk-coefficient/load_risk_coefficient.js', null,
          function(err, stdout, stderr) {
            if (err || stderr) {
              reject(Error(err + stderr));
            } else {
              resolve(stdout);
            }
          }
      );
    });
    return promise;
  }),

  fullyLoadTSubLData: (() => {
    process.stdout.write('   loading t-sub-l data...');
    const promise = new Promise(function(resolve, reject) {
      execSh('node ./src/lib/db/tsubl/load_tsubl.js', null,
          function(err, stdout, stderr) {
            if (err || stderr) {
              reject(Error(err + stderr));
            } else {
              resolve(stdout);
            }
          }
      );
    });
    return promise;
  }),

  fullyLoadAllData: (() =>  {
    DataLoader.fullyLoadDeterministicData().then(() => {
      DataLoader.fullyLoadProbabilisticData().then(() => {
        DataLoader.fullyLoadRiskCoefficientData().then(() => {
          DataLoader.fullyLoadTSubLData();
        });
      });
    });
  }),

  incrementalLoadTSubL: (() => {
    process.stdout.write('   loading t-sub-l data...');
    const promise = new Promise(function(resolve, reject) {
      execSh('node ./src/lib/db/tsubl/load_tsubl_increment.js', null,
          function(err, stdout, stderr) {
            if (err || stderr) {
              reject(Error(err + stderr));
            } else {
              resolve(stdout);
            }
          }
      );
    });
    return promise;
  })

};

DataLoader.printMenu();

rl.on('line', function (line) {
  if (isNaN(line)) {
    process.stdout.write('Please enter a valid number option.');
    DataLoader.printMenu();
  } else {

    const num = Number(line);

    switch (num) {
    case 1:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n  Fully loading all data sets...');
      process.stdout.write('\r\n  ****************************************');
      DataLoader.startTiming();
      DataLoader.fullyLoadAllData().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 2:
      process.stdout.write('\r\n  Incrementally loading all data sets...');
      break;
    case 3:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n   Fully loading deterministic data sets');
      process.stdout.write('\r\n  ****************************************');
      DataLoader.startTiming();
      DataLoader.fullyLoadDeterministicData().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 4:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n  Fully loading probabilistic data sets...');
      process.stdout.write('\r\n  ****************************************');
      DataLoader.startTiming();
      DataLoader.fullyLoadProbabilisticData().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 5:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n  Fully loading risk coefficient data sets...');
      process.stdout.write('\r\n  ****************************************');
      DataLoader.startTiming();
      DataLoader.fullyLoadRiskCoefficientData().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 6:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n  Fully loading t-sub-l data sets...');
      process.stdout.write('\r\n  ****************************************');
      DataLoader.startTiming();
      DataLoader.fullyLoadTSubLData().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 10:
      rl.close();
      process.stdout.write('\r\n  ****************************************');
      process.stdout.write('\r\n  Incrementally loading t-sub-l data sets...');
      process.stdout.write('\r\n  ****************************************\r\n');
      DataLoader.startTiming();
      DataLoader.incrementalLoadTSubL().then(() => {
        DataLoader.stopTiming();
      });
      break;
    case 11:
      process.stdout.write('\r\n\r\n   Bye!   ');
      rl.close();
      process.stdin.destroy();
      break;
    default:
      process.stdout.write('\r\n!! No Number Entered !!');
      break;
    }
  }

});
