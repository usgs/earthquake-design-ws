'use strict';


const NSHM2008Factory = require('../basis/nshm_2008-factory'),
    extend = require('extend');


const _DEFAULTS = {
  referenceDocument: 'IBC-2015'
};


/**
 * Class: IBC2015Factory
 *
 * @param options Object
 *.     Configuration options for this instance.
 */
const IBC2015Factory = function (options) {
  let _this;


  options = extend({}, _DEFAULTS, options);
  _this = NSHM2008Factory(options);


  options = null;
  return _this;
};


module.exports = IBC2015Factory;
