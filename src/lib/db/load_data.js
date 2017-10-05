'use strict';

const inquirer = require('inquirer'),
    dbUtils = require('./db-utils'),
    AbstractDataLoader = require('./abstract-data-loader'),
    DeterministicDataLoader = require('./deterministic/deterministic-data-loader'),
    ProbabilisticDataLoader = require('./probabilistic/probabilistic-data-loader'),
    RiskCoefficientDataLoader =
        require('./risk-coefficient/risk-coefficient-data-loader.js'),
    TSubLDataLoader = require('./tsubl/tsubl-data-loader.js');

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


const LOADER_FACTORIES = {
  'deterministic': DeterministicDataLoader,
  'probabilistic': ProbabilisticDataLoader,
  'risk-coefficient': RiskCoefficientDataLoader,
  'tsubl': TSubLDataLoader
};

const DATASETS = Object.keys(LOADER_FACTORIES);

const INTERACTIVE_PROMPT = 'Interactive (WARNING, currently same as "Missing")';
const MISSING_PROMPT = 'Missing (Install only missing data)';
const SILENT_PROMPT = 'Silent (Remove existing data and install all data)';

const USAGE = `
Usage: node master_data_loader [(--missing|--silent)] [--data=all]

  Default is to run in interactive mode, unless one of the following is present:

  --missing:
          only add new data, without prompting for confirmation.
  --silent:
          replace all existing data, without prompting for confirmation.


  --data=deterministic,probabilistic,risk-coefficient,tsubl
      Comma separated list of one or more of the following data sets:

      deterministic
      probabilistic
      risk-coefficient
      tsubl
`;


Promise.resolve().then(() => {
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
}).catch((e) => {
  process.stderr.write(`Error parsing arguments: ${e.message}\n`);
  process.stderr.write(USAGE);
  process.exit(1);
}).then((args) => {
  let prompt;

  if (args.mode !== AbstractDataLoader.MODE_INTERACTIVE) {
    // non-interactive mode, arguments already parsed
    return args;
  }

  // interactively prompt user for arguments
  prompt = inquirer.createPromptModule();
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
      return {
        dataSets: args.dataSets,
        mode: AbstractDataLoader.MODE_MISSING
      };
    } else if (mode === SILENT_PROMPT) {
      return {
        dataSets: args.dataSets,
        mode: AbstractDataLoader.MODE_SILENT
      };
    }

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
        mode: AbstractDataLoader.MODE_INTERACTIVE
      };
    });
  });
}).then((args) => {
  let dataSets,
      mode,
      promise;

  dataSets = args.dataSets;
  mode = args.mode;
  promise = Promise.resolve();

  dataSets.forEach((dataSet) => {
    promise = promise.then(() => {
      let factory;

      factory = LOADER_FACTORIES[dataSet];
      process.stderr.write(`Loading ${dataSet} data set\n`);

      return dbUtils.getDefaultAdminDB().then((adminDb) => {
        let loader = factory({
          db: adminDb,
          mode: mode
        });

        return loader.run().catch((e) => {
          process.stderr.write('Error loading data\n');
          if (e && e.stack) {
            process.stderr.write(e.stack);
          }
        }).then(() => {
          adminDb.end();
        });
      });
    });
  });

  return promise;
}).then(() => {
  process.stderr.write('Done loading data\n');
}).catch((e) => {
  process.stderr.write('Something unexpected went wrong\n');
  if (e && e.stack) {
    process.stderr.write(e.stack);
  }
});
