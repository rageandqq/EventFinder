/* Global config */
APP_NAME = "Event Finder";

var app = angular.module('EventbriteApp', ['ngResource', 'ngMaterial']);

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('blue')
    .backgroundPalette('indigo', {
     'default': '900' 
    });
});

function Queue() {
  var q = [];
  
  this.empty = function() {
    return q.length == 0;
  };

  this.length = function() {
    return q.length;
  };

  this.enqueue = function(elem) {
    q.push(elem);
  };

  this.dequeue = function() {
    if (this.empty()) {
      return null;
    }
    
    var elem = q[0];
    if (q.length > 1) {
      q = q.slice(1);
    }
    else {
      q = [];
    }
    return elem;

  };

  this.peek = function() {
    return this.empty() ? null : q[0];
  };

  this.clear = function() {
    while(!this.empty()) {
      this.dequeue();
    }
  };
};
