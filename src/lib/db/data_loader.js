'use strict';

const inquirer = require('inquirer'),
    dbUtils = require('./db-utils'),
    DeterministicDataLoader = require('./deterministic/load_deterministic.js'),
    ProbabilisticDataLoader = require('./probabilistic/load_probabilistic.js'),
    RiskCoefficientDataLoader = require('./risk-coefficient/load_risk_coefficient.js'),
    TSubLDataLoader = require('./tsubl/load_tsubl.js');

let dterministicDataLoader,
    probabilisticDataLoader,
    riskCoEffDataLoader,
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
      DataLoader.fullyLoadDeterministicData(),
      DataLoader.fullyLoadProbabilisticData(),
      DataLoader.fullyLoadRiskCoefficientData(),
      DataLoader.fullyLoadTSubLData()
    ]).then((result) => {
      return result;
    }).catch((err) => {
      process.stdout.write('\nUnexpected Error: ' + err.message);
    });
  }),

  fullyLoadDeterministicData: (() => {
    dbUtils.getDefaultAdminDB().then((adminDB) => {
      dterministicDataLoader = DeterministicDataLoader(adminDB);
      dterministicDataLoader.createIndexes;
    });
  }),

  fullyLoadProbabilisticData: (() => {
    dbUtils.getDefaultAdminDB().then((adminDB) => {
      probabilisticDataLoader = ProbabilisticDataLoader(adminDB);
      probabilisticDataLoader.createIndexes;
    });
  }),

  fullyLoadRiskCoefficientData: (() => {
    dbUtils.getDefaultAdminDB().then((adminDB) => {
      riskCoEffDataLoader = RiskCoefficientDataLoader(adminDB);
      riskCoEffDataLoader.createIndexes;
    });
  }),

  fullyLoadTSubLData: (() => {
    dbUtils.getDefaultAdminDB().then((adminDB) => {
      tsublDataLoader = TSubLDataLoader(adminDB);
      tsublDataLoader.createIndexes;
    });
  })
};


/**
 * Determine what data the user wants loaded, either through a menu-driven
 * interface or CLI switches.
 */

 // Perform data loading silently based on cli switches used
if (promptSwitch.includes('--')) {

  // TODO - also include a help switch

  let command = promptSwitch.substr(2, promptSwitch.length);

  process.stdout.write('COMMAND -> ' + command);

  if (command === 'silent') {
    DataLoader.loadAllDataSets().then(() => {
      // Done
    }).catch((e) => {
      process.stdout.write('\n\n** Unexpected Error: ' + e.message);
    });
  } else if (command === 'missing') {
    // TODO: implement logic for loading only missing data
  }
} else {
  // Provide CLI Menu Prompts to guide user in data loading
  const prompt = inquirer.createPromptModule();
  prompt(main_menu_questions).then((selection) => {

    if (selection['MAIN_MENU'] === main_menu_questions[0].choices[0]) {
      // TODO: Invoke loadAllDataSets();
      process.stdout.write('*** Loading All Data Sets ***\r\n');

      DataLoader.loadAllDataSets().then((/*result*/) => {
        //process.stdout.write('\n\n' + result + '\n\n');
      }).catch((e) => {
        process.stdout.write('Unexpected Error: ' + e.message);
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