'use strict';


const extend = require('extend'),
    inputJson = require('./etc/asce41_13-qc.json');

const outputJson = [];

inputJson.forEach((location) => {
  // --------------------
  // ASCE41* Documents
  // --------------------
  let custom,
      standard;

  standard = extend(true, {}, location);
  custom = extend(true, {}, location);

  // Change parameter to be title as expected
  standard.request.parameters.title = standard.request.parameters.label;
  delete standard.request.parameters.label;

  custom.request.parameters.title = custom.request.parameters.label;
  delete custom.request.parameters.label;

  // Remove custom responses from standard object
  standard.response.data = standard.response.data.filter((item) => {
    return !item.hasOwnProperty('customProbability');
  });

  // Remove standard responses from custom object
  custom.response.data = custom.response.data.filter((item) => {
    return item.hasOwnProperty('customProbability');
  });

  // Move custom probability from response.data to request.parameters
  custom.request.parameters.customProbability =
      custom.response.data[0].customProbability;
  delete custom.response.data[0].customProbability;

  outputJson.push(standard);
  outputJson.push(custom);



  // --------------------
  // ASCE7* Documents
  // --------------------
  // let updated;

  // updated = extend(true, {}, location);

  // // Correct reference document
  // updated.request.referenceDocument = updated.request.referenceDocument
  //     .replace('_', '-');

  // // Add risk-category
  // updated.request.parameters.riskCategory = 'I';

  // // Move 'label' parameter to 'title' parameter
  // updated.request.parameters.title = updated.request.parameters.label;
  // delete updated.request.parameters.label;

  // // Create separate requests for each site class
  // updated.response.data.forEach((item) => {
  //   let copy;

  //   copy = extend(true, {}, updated);

  //   // Move site class from response.data.obj --> request.parameters
  //   copy.response.data = extend(true, {}, item);
  //   copy.request.parameters.siteClass = copy.response.data.siteClass;
  //   delete copy.response.data.siteClass;


  //   outputJson.push(copy);
  // });
});

outputJson.sort((a, b) => {
  let aVal,
      bVal;

  // Sort by name first
  aVal = a.request.parameters.title;
  bVal = b.request.parameters.title;

  if (aVal !== bVal) {
    return aVal.localeCompare(bVal);
  }

  // If names match, sort by latitude
  aVal = a.request.parameters.latitude;
  bVal = b.request.parameters.latitude;

  if (aVal !== bVal) {
    return aVal - bVal;
  }

  // If latitudes match, sort by longitude
  aVal = a.request.parameters.longitude;
  bVal = b.request.parameters.longitude;

  if (aVal !== bVal) {
    return aVal - bVal;
  }

  // If longitudes match, sort by site class
  aVal = a.request.parameters.siteClass;
  bVal = b.request.parameters.siteClass;

  if (aVal !== bVal) {
    return aVal.localeCompare(bVal);
  }

  if (Array.isArray(a.response.data) && Array.isArray(b.response.data)) {
    aVal = a.response.data.length;
    bVal = b.response.data.length;

    if (aVal !== bVal) {
      // Sort by array length _descending_
      return bVal - aVal;
    }
  }

  // All properties matched ...
  return 0;
});

process.stdout.write(JSON.stringify(outputJson, null, 2) + '\n');

process.exit(0);
