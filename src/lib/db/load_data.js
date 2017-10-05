'use strict';

const inquirer = require('inquirer'),
    dbUtils = require('./db-utils'),
    AbstractDataLoader = require('./abstract-data-loader'),
    DeterministicDataLoader = require('./deterministic/deterministic-data-loader'),
    ProbabilisticDataLoader = require('./probabilistic/probabilistic-data-loader'),
    RiskCoefficientDataLoader =
        require('./risk-coefficient/risk-coefficient-data-loader.js'),
    TSubLDataLoader = require('./tsubl/tsubl-data-loader.js');


const LOADER_FACTORIES = {
  'deterministic': DeterministicDataLoader,
  'probabilistic': ProbabilisticDataLoader,
  'risk-coefficient': RiskCoefficientDataLoader,
  'tsubl': TSubLDataLoader
};

const DATASETS = Object.keys(LOADER_FACTORIES);

const USAGE = `
Usage: node load_data.js [-h] [(--interactive|--missing|--silent)] [--data=all]

  Default is to run in interactive mode for all data sets.

  Help:
    -h, --help:
      show this usage and exit.

  Mode:
    Default is --interactive

    --interactive: (Default)
        add new data, prompt to replace existing data

    --missing:
        only add new data, without prompting for confirmation

    --silent:
        replace all existing data, without prompting for confirmation

  Data Sets:
    Default is all data sets

    --data=${DATASETS.join(',')}

        Comma separated list of one or more of the following data sets:

        ${DATASETS.join(', ')}

  Database connection information for non-interactive mode:
    Uses the following config file variables
      DB_HOST
      DB_PASSWORD
      DB_PORT
      DB_USER

    The following environment variables override corresponding config variables:
      DB_ADMIN_HOST
      DB_ADMIN_PASSWORD
      DB_ADMIN_PORT
      DB_ADMIN_USER

`;


/**
 * Parse command line arguments.
 *
 * @return {Object}
 *     mode {'interactive'|'missing'|'silent'}
 *     dataSets {Array<String>}
 */
function parseArguments () {
  let argv,
      dataSets = DATASETS,
      missing = false,
      mode,
      silent = false;

  // skip node and script name
  argv = process.argv.slice(2);

  argv.forEach((arg) => {
    if (arg === '--silent') {
      silent = true;
    } else if (arg === '--missing') {
      missing = true;
    } else if (arg.startsWith('--data=')) {
      arg = arg.replace('--data=', '');
      dataSets = arg.split(',');
    } else if (arg === '--help' || arg === '-h') {
      process.stderr.write(USAGE);
      process.exit(1);
    } else {
      throw new Error(`Unknown argument ${arg}`);
    }
  });

  if (silent && missing) {
    throw new Error('Cannot use --silent and --missing');
  }

  dataSets.forEach((dataSet) => {
    if (!DATASETS.includes(dataSet)) {
      throw new Error(`Unknown dataset ${dataSet}`);
    }
  });

  mode = AbstractDataLoader.MODE_INTERACTIVE;
  if (missing) {
    mode = AbstractDataLoader.MODE_MISSING;
  } else if (silent) {
    mode = AbstractDataLoader.MODE_SILENT;
  }

  return {
    dataSets: dataSets,
    mode: mode
  };
}

/**
 * Prompt the user interactively for arguments.
 *
 * @param args {Object}
 *     command line arguments.
 * @param args.mode {String}
 *     should be 'interactive' if this method is called.
 * @param args.dataSets {Array<String>}
 *     array of data sets specified on command line.
 */
function getInteractiveArguments (args) {
  const INTERACTIVE_PROMPT = 'Interactive (add new data, prompt to replace existing data)';
  const MISSING_PROMPT = 'Missing (only add new data, without prompting for confirmation)';
  const SILENT_PROMPT = 'Silent (replace all existing data, without prompting for confirmation)';

// interactively prompt user for arguments
  let prompt = inquirer.createPromptModule();
  return prompt([
    {
      name: 'mode',
      type: 'list',
      message: 'Choose installation mode',
      default: 0,
      choices: [
        INTERACTIVE_PROMPT,
        MISSING_PROMPT,
        SILENT_PROMPT
      ]
    }
  ]).then((selection) => {
    let mode = selection.mode;
    if (mode === MISSING_PROMPT) {
      mode = AbstractDataLoader.MODE_MISSING;
    } else if (mode === SILENT_PROMPT) {
      mode = AbstractDataLoader.MODE_SILENT;
    } else {
      mode = AbstractDataLoader.MODE_INTERACTIVE;
    }

    // started in interactive mode,
    // prompt for datasets before potentially switching mode
    return prompt([
      {
        name: 'dataSets',
        type: 'checkbox',
        message: 'Which data sets do you want to install/update?',
        choices: DATASETS,
        default: args.dataSets
      }
    ]).then((selection) => {
      return {
        dataSets: selection.dataSets,
        mode: mode
      };
    });
  });
}

/**
 * Use the specified arguments to run data load.
 *
 * @param args {Object}
 *     command line arguments.
 * @param args.mode {'interactive'|'missing'|'silent'}
 *     installation mode.
 * @param args.dataSets {Array<String>}
 *     array of data sets to be loaded.
 * @param adminDb {Promise<pg.Client>}
 *     promise representing admin database connection
 */
function loadData(args, dbFactory) {
  let dataSets,
      mode,
      promise;

  dataSets = args.dataSets;
  mode = args.mode;
  promise = Promise.resolve();

  dataSets.forEach((dataSet) => {
    promise = promise.then(() => {
      return dbFactory.then((adminDb) => {
        process.stderr.write(`Loading ${dataSet} data set\n`);

        let loader = LOADER_FACTORIES[dataSet]({
          db: adminDb,
          mode: mode
        });

        return loader.run().catch((e) => {
          process.stderr.write('Error loading data\n');
          if (e && e.stack) {
            process.stderr.write(e.stack);
          }
        });
      });
    });
  });

  return promise;
}


// Main load data logic
function main () {
  let dbFactory;

  Promise.resolve().then(() => {
    return parseArguments();
  }).catch((e) => {
    process.stderr.write(`Error parsing arguments: ${e.message}\n`);
    process.stderr.write(USAGE);
    process.exit(1);
  }).then((args) => {
    if (args.mode === AbstractDataLoader.MODE_INTERACTIVE) {
      dbFactory = dbUtils.getAdminDb();
    } else {
      dbFactory = dbUtils.getNonInteractiveAdminDB();
    }

    return dbFactory.then(() => {
      return args;
    });
  }).then((args) => {
    if (args.mode === AbstractDataLoader.MODE_INTERACTIVE) {
      return getInteractiveArguments(args);
    } else {
      return args;
    }
  }).then((args) => {
    return loadData(args, dbFactory);
  }).then(() => {
    process.stderr.write('Done loading data\n');
  }).catch((e) => {
    process.stderr.write('Something unexpected went wrong\n');
    if (e && e.stack) {
      process.stderr.write(e.stack);
    }
  }).then(() => {
    // done loading data, close db connection
    dbFactory.then((adminDb) => {
      adminDb.end();
    });
  });
}


// run the main method
main();
