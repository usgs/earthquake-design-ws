'use strict';

const inquirer = require('inquirer');

const main_menu_questions = [
  {
    type: 'list',
    name: 'MAIN_MENU',
    choices: [
      'Load All Data Sets',
      'Load A Data Set',
      'Load Partial Data Set'
    ],
    message: 'Please select one of the following menu options:'
  }
];

const promptSwitch = (process.argv[2] === undefined) ? '--menu' : process.argv[2];

/**
 * Determine what data the user wants loaded, either through a menu-driven
 * interface or CLI switches.
 */
if (promptSwitch === '--menu') {
  const prompt = inquirer.createPromptModule();
  prompt(main_menu_questions).then((selection) => {

    if (selection['MAIN_MENU'] === main_menu_questions[0].choices[0]) {
      // TODO: Invoke loadAllDataSets();
      process.stdout.write('*** Loading All Data Sets ***');
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
  process.stdout.write('Handling CLI Switches...');
}