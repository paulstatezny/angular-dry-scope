angular.module('functional-scope', [])
  .config(function($provide) {
    $provide.decorator('$rootScope', rootScopeFunctionalDecorator)
  });

function rootScopeFunctionalDecorator($delegate) {
  $delegate.$$definitions = {};

  $delegate.$define = function(property, definition) {
    this.$$definitions[property] = definition;
  };

  $delegate.$update = function(changes) {
    for (var key in changes) {
      this[key] = changes[key];
    }
    for (var key in this.$$definitions) {
      var result = this.$$definitions[key]();
      if (this[key] !== result) {
        this[key] = result;
      }
    }
  };

  return $delegate;
}