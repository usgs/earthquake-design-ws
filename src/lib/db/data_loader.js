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

/**
 * CLI switches can include the following options:
 *
 *  --silent : Do not prompt user, assume answer yes to all questions effectively
 *             reloading all the data.
 *  --missing: Do not prompt user. Do not drop/reload schema. Do not drop
 *             existing regions/documents. DO add missing regions/documents.
 *             Do load missing data.
 */
const promptSwitch = (process.argv[2] === undefined) ? '' : process.argv[2];


const DataLoader = {

  loadAllDataSets: (() => {
    return Promise.all([
      //DataLoader.fullyLoadDeterministicData(),
      //DataLoader.fullyLoadProbabilisticData(),
      //DataLoader.fullyLoadRiskCoefficientData(),
      DataLoader.fullyLoadTSubLData()
    ]).then((result) => {
      return result;
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
if (promptSwitch.includes('--')) {

  let command = promptSwitch.substr(2, promptSwitch.length);

  process.stdout.write('COMMAND -> ' + command);

  if (command === 'silent') {
    dbUtils.getDefaultAdminDB().then((adminDB) => {
      db = adminDB;
      DataLoader.loadAllDataSets().then((/*result*/) => {
        //process.stdout.write('\n\n' + result + '\n\n');
      }).catch((e) => {
        process.stdout.write('Unexpected Error: ' + e.message);
      });
    }).catch((e) => {
      process.stdout.write('Unexpected Error: ' + e.message);
    });
  } else if (command === 'missing') {
    // TODO: implement logic for loading only missing data
  }


} else {
  const prompt = inquirer.createPromptModule();
  prompt(main_menu_questions).then((selection) => {

    if (selection['MAIN_MENU'] === main_menu_questions[0].choices[0]) {
      // TODO: Invoke loadAllDataSets();
      process.stdout.write('*** Loading All Data Sets ***\r\n');

      dbUtils.getAdminDb().then((adminDB) => {
        db = adminDB;

        DataLoader.loadAllDataSets().then((/*result*/) => {
          //process.stdout.write('\n\n' + result + '\n\n');
        }).catch((e) => {
          process.stdout.write('Unexpected Error: ' + e.message);
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
}