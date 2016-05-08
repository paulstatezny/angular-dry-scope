var angular = require('angular');

function rootScopeFunctionalDecorator($delegate) {
  var prototype = Object.getPrototypeOf($delegate);
  var $new = prototype.$new;

  prototype.$new = function() {
    var scope = $new.apply(this, arguments);

    // Perform $update when after ancestor scopes call $update
    scope.$on('$update', scope.$update.bind(scope, null));

    return scope;
  };

  prototype.$define = function(property, definition) {
    if (!this.$$definitions) {
      this.$$definitions = {};
    }

    this.$$definitions[property] = definition.bind(this);
  };

  prototype.$update = function(changes, event) {
    // Avoid infinite loop since the event cycle starts at the scope on which $broadcast was called
    if (event && event.targetScope === this) {
      return;
    }

    // Apply changeset
    for (var key in (changes || {})) {
      this[key] = changes[key];
    }

    // Re-run definitions and update scope only if they yield new values
    for (var key in (this.$$definitions || {})) {
      var result = this.$$definitions[key]();
      if (this[key] !== result) {
        this[key] = result;
      }
    }

    // Notify child scopes to run update
    this.$broadcast('$update');
  };

  return $delegate;
}

module.exports = angular.module('functional-scope', [])
  .config(function($provide) {
    $provide.decorator('$rootScope', rootScopeFunctionalDecorator)
  });