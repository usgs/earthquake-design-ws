'use strict';

var CsvParser = require('../../util/csv-parser'),
    dbUtils = require('../db-utils');


var documents = require('./documents.json'),
    regions = require('./regions.json');


// TODO:
// - create tables
// - load regions
//   - download region csv, load region data
// - load documents


dbUtils.getAdminDb().then((/*db*/) => {
  var regionPromises;

  regionPromises = regions.map((region) => {
    process.stderr.write('load region ' +
        JSON.stringify(region, null, 2) + '\n');

    var c = CsvParser({
      url: region.url
    });
    c.onData = function (/*obj*/) {
      // process.stderr.write(JSON.stringify(obj, null, 2) + '\n');
    };
    return c.parse();
  });

  Promise.all(regionPromises).then(() => {
    documents.forEach((document) => {
      process.stderr.write('load document ' +
          JSON.stringify(document, null, 2) + '\n');
    });
  });

  //db.query('SELECT * FROM test');
}).catch((err) => {
  process.stderr.write('error connecting to database ' + err);
});
