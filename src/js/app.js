var AUTH_TOKEN = 'GKE4XT5V7P23RIPNGQPD';

var app = angular.module('EventbriteApp', ['ngResource']);

/* Controllers */
app.controller('MainController', ['$scope', '$timeout', 'PopularEvents', function($scope, $timeout, _events) {

  var geoHandler = function(position) {
    $timeout(function() {
      loadComplete();
      load('Loading nearby events...');
      $scope.userPosition = position;
      _events.get({
        latitude: position.coords.latitude, 
        longitude: position.coords.longitude,
        range: $scope.eventRange + ($scope.unitsInKilometres? 'km' : 'mi')
      }, 
      function(rsp) {
        loadComplete();
        console.log(rsp);
      });
    });
  };

  function loadComplete() {
    $scope.loadingQueue.dequeue();
  };

  function load(msg) {
    $scope.loadingQueue.enqueue(msg);
  };

  function init() {
    $scope.name = 'World';
    $scope.userPosition = null;
    $scope.eventRange = 50;
    $scope.unitsInKilometres = true;
    $scope.currentEvent = null;
    $scope.eventQueue = new Queue();
    $scope.loadingQueue = new Queue();

    load('Fetching location...');

    navigator.geolocation.getCurrentPosition(geoHandler); //get location, pass response to handler
  };

  init();

}]);

/* Directives */


/* Services */
app.factory('PopularEvents', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: ''}, isArray: false } 
          });
    }
]);

/* Helpers */
//FIFO structure: queue
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

  }

  this.peek = function() {
    return this.empty() ? null : q[0];
  }
};
