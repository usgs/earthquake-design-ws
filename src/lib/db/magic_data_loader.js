'use strict';

const inquirer = require('inquirer'),
    dbUtils = require('./db-utils'),
    execSh = require('exec-sh'),
    TSubLDataLoader = require('./tsubl/load_tsubl.js');

let db,
    tsublDataLoader;

const main_menu_questions = [
  {
    type: 'list',
    name: 'MAIN_MENU',
    choices: [
      'Would you like to load the schema?',
      'Would you like to load the reference data?',
      'Would you like to load the data?'
    ],
    message: 'Please select one of the following menu options:'
  }
];

const promptSwitch = (process.argv[2] === undefined) ? '--menu' : process.argv[2];

const DataLoader = {

  loadAllDataSets: (() => {
    return Promise.all([
      //DataLoader.fullyLoadDeterministicData(),
      //DataLoader.fullyLoadProbabilisticData(),
      //DataLoader.fullyLoadRiskCoefficientData(),
      DataLoader.fullyLoadTSubLData()
    ]).then(() => {

    }).catch((err) => {
      process.stdout.write(err.message);
    });
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
    tsublDataLoader = TSubLDataLoader(db);
    process.stdout.write('\n\n   loading t-sub-l data...\n\n');
    const promise = new Promise((resolve) => {
      tsublDataLoader.createIndexes();
      resolve();
    }).catch((/*err*/) => {
      //reject(Error(err));
    });
    return promise;
  })
};


/**
 * Determine what data the user wants loaded, either through a menu-driven
 * interface or CLI switches.
 */
if (promptSwitch === '--menu') {
  const prompt = inquirer.createPromptModule();
  prompt(main_menu_questions).then((selection) => {

    if (selection['MAIN_MENU'] === main_menu_questions[0].choices[0]) {
      // TODO: Invoke loadAllDataSets();
      process.stdout.write('*** Loading All Data Sets ***\r\n');

      dbUtils.getAdminDb().then((adminDB) => {
        db = adminDB;

        DataLoader.loadAllDataSets().then((result) => {
          process.stdout.write('\n\n' + result + '\n\n');
        });

      }).catch((e) => {
        process.stdout.write('ERROR: ' + e.message);
      });

    } else if (selection['MAIN_MENU'] === main_menu_questions[0].choices[1]) {
      // TODO: Ask user which Data Set to be loaded
      process.stdout.write('Which Data Set to load...');
    } else {
      // TODO: Ask User Which Data Set, then when Region(s) to load
      process.stdout.write('Which Data Set, then Which Region to load...');
    }

  });
} else {
  // TODO: Handle CLI Switches
  process.stdout.write('Handling CLI Switches...\r\n\r\n');

  dbUtils.getAdminDb().then((adminDB) => {
    db = adminDB;
  }).catch((e) => {
    process.stdout.write(e.message);
  });
}