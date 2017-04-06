'use strict';


var types = require('pg').types;


var _typeParserInteger,
    _typeParserNumeric;


_typeParserInteger = function (value) {
  return parseInt(value, 10);
};

_typeParserNumeric = function (value) {
  return parseFloat(value);
};

/**
 * This script statically registers data parsers for data returned from the
 * database. This doesn't cover all data types that may be returned, but
 * only the data types known to exist in the current schema. This should be
 * updated as the schema are updated.
 *
 * To use these parsers, any code using the 'pg' package to query the database
 * should simply require this script.
 *
 * Note: The default behavior is for data to be returned as Strings, so no
 *       additional parser is necessary.
 */

// Register the parsers...
// Note :: This only happens once even is multiple modules require this module.

// OID = 23 --> Int4
// Note :: We do not register a parser for Int8 (OID=20) since Node does not
//         have support for 64 bit integers. In this case, Strings are
//         safer and custom handling may be implemented.
types.setTypeParser(23, (value) => {
  return parseInt(value, 10);
});

// OID = 1700 --> 'Numeric'
types.setTypeParser(1700, (value) => {
  return parseFloat(value);
});

// To find additional type OID values, run this query in the database:
//     SELECT typname, oid FROM pg_type ORDER BY oid


module.exports = {
  typeParserNumeric: _typeParserNumeric,
  typeParserInteger: _typeParserInteger
};