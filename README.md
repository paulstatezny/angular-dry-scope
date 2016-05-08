# angular-functional-scope

Bringing functional UI paradigms to Angular 1.

## The Vision

You're an informed Front End web developer. You know to avoid watchers and filters in Angular 1 because they cause performance problems. But you also know that functional programming paradigms (defining your app state using a function instead of "manually" modifying it) are very powerful and allow you to write applications that are easier to read, maintain, and change.

Angular Functional Scope allows you to define scope properties as **definition** functions that return the value of the property. **Definitions** are similar in intent, although different in mechanism, to **watchers**. Watchers say, "when this scope value changes, run this code." Definitions say, "this function will return the correct value of this property at any time." And every time the scope is updated via `$update`, the definitions are re-run.

See below for more examples.

## Installation

Install using NPM:

```
npm install angular-functional-scope --save
```

Then import it as a module in your Angular app:

```js
angular.module('MyApp', ['functional-scope'])
```

## Usage

### 1. Define scope properties as functions

```js
$scope.$define('totalCost', function() {
  var costBeforeTax = $scope.items.reduce(function(total, item) {
    return total + item.cost;
  }, 0);

  return costBeforeTax * taxMultiplier;
});
```

### 2. Update scope via $update

Don't do this:

```js
$scope.taxMultiplier = 1.08;
```

Instead, do this:

```js
$scope.$update({
  taxMultiplier: 1.08
});
```

And `$scope.totalCost` will automatically be updated!

## Purpose

This module is an experiment to examine the use of newer functional UI approaches in Angular 1. It was inspired by the state/props model of React.js. `$update` was shamelessly based on React's `setState`.