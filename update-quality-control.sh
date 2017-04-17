#!/bin/bash

#
# Simple command-line script to run the QC test suite and update the local
# quality-control.md file.
#

pushd `dirname $0` > /dev/null 2>&1;

outfile='./quality-control.md';

echo "Running tests and sending output to ${outfile}.";
echo "This may take several minutes to complete.";

node \
  ./node_modules/mocha/bin/mocha \
  test/qc/**/*.qc.js \
  --reporter ../../../gh-reporter.js > $outfile;

returnStatus=$?;

popd > /dev/null 2>&1;

exit $returnStatus;
