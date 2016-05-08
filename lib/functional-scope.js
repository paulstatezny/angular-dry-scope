var angular = require('angular');

function rootScopeFunctionalDecorator($delegate) {
  var prototype = Object.getPrototypeOf($delegate);

  // Capture the original $new in order to extend it
  var $new = prototype.$new;

  /**
   * @override
   * @name $rootScope.Scope#$new
   *
   * @description
   * Add an event listener for the $update event upon scope creation.
   * This event will be broadcasted by ancestor scopes whenever $update is called on them.
   *
   * @return {Scope}
   */
  prototype.$new = function() {
    var scope = $new.apply(this, arguments);

    // Perform $update when after ancestor scopes call $update
    scope.$on('$update', scope.$update.bind(scope, null));

    return scope;
  };

  /**
   * @name $rootScope.Scope#$define
   *
   * @description
   * Define a scope property in a functional programming fashion: not as an explicit value,
   * but as a function which returns the value.
   *
   * Defining deep properties (e.g. 'user.email') is not supported. This is by design in order
   * to promote keeping components simple, modular, and focused. If a scope has dozens of properties,
   * the component (i.e. directive or controller) should probably be split into multiple modules
   * which are more focused.
   *
   * The definitions are held internally within a $$definitions object, keyed by the property.
   *
   * @param  {String}   property    The scope property that will be defined
   * @param  {Function} definition  A function that returns the current value of the scope
   *                                based on data on the scope or elsewhere.
   */
  prototype.$define = function(property, definition) {
    if (!this.$$definitions) {
      this.$$definitions = {};
    }

    this.$$definitions[property] = definition.bind(this);
  };

  /**
   * @name $rootScope.Scope#$update
   *
   * @description
   * Update the scope with some changes and then check all of the current definitions
   * and update the scope with any values which have changed based on the return values of those
   * definitions.
   *
   * Example:
   *     scope.$update({
   *       viewMode: 'standard'
   *     });
   *
   * @param  {Object} changes The changes to make to the given scope
   * @param  {Object} event   The event given whenever $update is called via $broadcast
   */
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