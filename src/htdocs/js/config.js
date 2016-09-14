'use strict';


var _onDomContentLoaded,
    _parseConfig,
    _updateDom;

_onDomContentLoaded = function () {
  var config;

  config = _parseConfig();
  _updateDom(config);
};

_parseConfig = function () {
  var url;

  url = window.location.toString();

  url = url.split('/');
  url = url.slice(0, url.length - 1);

  return {
    url: url.join('/')
  };
};

_updateDom = function (config) {
  var elements,
      url;

  url = config.url;

  elements = document.querySelectorAll('.url-stub');

  Array.prototype.forEach.call(elements, function (element) {
    element.innerHTML = url;
  });
};


document.addEventListener('DOMContentLoaded', _onDomContentLoaded);
