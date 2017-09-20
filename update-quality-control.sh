#!/bin/bash

#
# Simple command-line script to run the QC test suite and update the local
# quality-control.md file.
#

pushd `dirname $0` > /dev/null 2>&1;

echo "Running tests and sending output to ${outfile}.";
echo "This may take several minutes to complete.";

# The list contains the QC filename | Reference Document
list=(
    "asce7.qc.js|asce7-10"
    "asce7.qc.js|asce7-16"
    "asce7.qc.js|asce7-05"
    "asce41.qc.js|asce41-13"
)

for i in "${!list[@]}";
do
  handler=`echo "${list[$i]}" | cut -d "|" -f 1`
  switch=`echo "${list[$i]}" | cut -d "|" -f 2`

  # Run the QC Reports individually indicating which report to run
  # from the array specified above.
  node \
  ./node_modules/mocha/bin/mocha \
  test/qc/${handler} \
  --reporter ../../../gh-reporter.js --${switch} > qc_reports/${switch}.md 2>&1
done

returnStatus=$?;

popd > /dev/null 2>&1;

exit $returnStatus;
