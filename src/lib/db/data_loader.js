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
 *  --data=:   Comma separated list of data sets to load.
 *
 * e.g., --silent --data=tsubl,deterministic
 */
const promptSwitch = (process.argv[2] === undefined) ? '' : process.argv[2];
const dataSwitch = (process.argv[3] === undefined) ? '' : process.argv[3];

const DataLoader = {

  loadAllDataSets: ((dataSets) => {

    let DATA = [];
    if (dataSets.includes('all') || dataSets.includes('deterministic')) {
      DATA.push(DataLoader.fullyLoadDeterministicData());
    }

    if (dataSets.includes('all') || dataSets.includes('probabilistic')) {
      DATA.push(DataLoader.fullyLoadProbabilisticData());
    }

    if (dataSets.includes('all') || dataSets.includes('risk_coefficient')) {
      DATA.push(DataLoader.fullyLoadRiskCoefficientData());
    }

    if (dataSets.includes('all') || dataSets.includes('tsubl')) {
      DATA.push(DataLoader.fullyLoadTSubLData());
    }

    return Promise.all(
        DATA
    ).then(() => {
      DataLoader.closeDBConnections();
      return;
    }).catch((err) => {
      process.stdout.write('\nUnexpected Error: ' + err.message);
    });
  }),

  loadPartialDataSets: ((dataSets) => {

    let DATA = [];
    if (dataSets.includes('all') || dataSets.includes('deterministic')) {
      DATA.push(DataLoader.loadMissingDeterministicData());
    }

    if (dataSets.includes('all') || dataSets.includes('probabilistic')) {
      DATA.push(DataLoader.loadMissingProbabilisticData());
    }

    if (dataSets.includes('all') || dataSets.includes('risk_coefficient')) {
      DATA.push(DataLoader.loadMissingRiskCoefficientData());
    }

    if (dataSets.includes('all') || dataSets.includes('tsubl')) {
      DATA.push(DataLoader.loadMissingTSubLData());
    }

    return Promise.all(
        DATA
    ).then(() => {
      process.stdout.write('\nDone loading partial data sets...');
      DataLoader.closeDBConnections();
    }).catch((err) => {
      process.stdout.write('\nUnexpected Exception: ' + err.message);
    });
  }),

  closeDBConnections: (() => {
    setTimeout(function() {
      try {
        tsublDataLoader.closeDBConnection();
      } catch(e) {
        // todo
      }
    }, 1000);

    setTimeout(function() {
      try {
        dterministicDataLoader.closeDBConnection();
      } catch (e) {
        // todo
      }
    }, 1000);

    setTimeout(function() {
      try {
        probabilisticDataLoader.closeDBConnection();
      } catch (e) {
        // todo
      }
    }, 1000);

    setTimeout(function() {
      try {
        riskCoEffDataLoader.closeDBConnection();
      } catch (e) {
        // todo
      }
    }, 1000);
  }),

  fullyLoadDeterministicData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      dterministicDataLoader = DeterministicDataLoader(adminDB);
      return dterministicDataLoader.createIndexes;
    });
  }),

  fullyLoadProbabilisticData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      probabilisticDataLoader = ProbabilisticDataLoader(adminDB);
      return probabilisticDataLoader.createIndexes;
    });
  }),

  fullyLoadRiskCoefficientData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      riskCoEffDataLoader = RiskCoefficientDataLoader(adminDB);
      return riskCoEffDataLoader.createIndexes;
    });
  }),

  fullyLoadTSubLData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      tsublDataLoader = TSubLDataLoader(adminDB);
      return tsublDataLoader.createSchema(true).then(() => {
        return tsublDataLoader.createIndexes();
      });
    });
  }),

  //-- Load Partial Data Sets

  loadMissingTSubLData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      tsublDataLoader = TSubLDataLoader(adminDB);
      return tsublDataLoader.createSchema(false).then(() => {
        return tsublDataLoader.loadMissingData();
      });
    });
  }),

  loadMissingDeterministicData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      dterministicDataLoader = DeterministicDataLoader(adminDB);
      return dterministicDataLoader.createSchema(false).then(() => {
        return dterministicDataLoader.loadMissingData();
      });
    });
  }),

  loadMissingProbabilisticData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      tsublDataLoader = TSubLDataLoader(adminDB);
      return tsublDataLoader.createSchema(false).then(() => {
        return tsublDataLoader.loadMissingData();
      });
    });
  }),

  loadMissingRiskCoefficientData: (() => {
    return dbUtils.getDefaultAdminDB().then((adminDB) => {
      tsublDataLoader = TSubLDataLoader(adminDB);
      return tsublDataLoader.createSchema(false).then(() => {
        return tsublDataLoader.loadMissingData();
      });
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
  let dataSets = ['all'];

  process.stdout.write('COMMAND -> ' + command);

  if (dataSwitch && dataSwitch.includes('--')) {
    try {
      let t = dataSwitch.substr(7, dataSwitch.length);
      dataSets = t.split(',');
      process.stdout.write('\nData Sets: ' + dataSets);
    } catch (e) {
      // TODO
    }
  }

  if (command === 'silent') {
    DataLoader.loadAllDataSets(dataSets).then(() => {
      process.stdout.write('\n\nDone!\n\n');
    }).catch((e) => {
      process.stdout.write('\n\n** Unexpected Error: ' + e.message);
    });
  } else if (command === 'missing') {
    DataLoader.loadPartialDataSets(dataSets).then(() => {
      process.stdout.write('\n\nDone!\n\n');
    }).catch((e) => {
      process.stdout.write('\n\n** Unexpected Error: ' + e.message);
    });
  }
} else {
  // Provide CLI Menu Prompts to guide user in data loading
  const prompt = inquirer.createPromptModule();
  prompt(main_menu_questions).then((selection) => {

    if (selection['MAIN_MENU'] === main_menu_questions[0].choices[0]) {
      // TODO: Invoke loadAllDataSets();
      process.stdout.write('*** Loading All Data Sets ***\r\n');

      DataLoader.loadAllDataSets().then(() => {
        process.stdout.write('\n\nDone!\n\n');
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