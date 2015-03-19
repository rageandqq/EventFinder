app.controller('MainController', ['$scope', '$timeout', 'PopularEvents', function($scope, $timeout, _events) {

  $scope.nextEvent = function() {
    $scope.currentEvent = $scope.eventQueue.dequeue();
  };

  $scope.viewEvent = function() {
    chrome.tabs.create({url : $scope.currentEvent.url});
  };

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
        if (rsp.events && rsp.events.length > 0) {
          addEvents(rsp.events);
          $scope.currentEvent = $scope.eventQueue.dequeue();
        }
      });
    });
  };

  function addEvents(eventList) {
    angular.forEach(eventList, function(e) {
      $scope.eventQueue.enqueue(e);
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
    $scope.eventRange = 20;
    $scope.unitsInKilometres = true;
    $scope.currentEvent = null;
    $scope.eventQueue = new Queue();
    $scope.loadingQueue = new Queue();

    load('Fetching location...');

    navigator.geolocation.getCurrentPosition(geoHandler); //get location, pass response to handler
  };

  init();

}]);

app.controller('CardController', ['$scope', function($scope) {

}]);
