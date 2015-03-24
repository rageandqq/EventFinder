bg = chrome.extension.getBackgroundPage();

app.controller('MainController', ['$scope', '$timeout', '$mdDialog', 'PopularEvents', function($scope, $timeout,$mdDialog,  _events) {

  $scope.nextEvent = function() {
    $scope.currentEvent = $scope.eventQueue.dequeue();
  };

  $scope.openSettings = function(event) {
    $mdDialog.show({
      controller: 'SettingsController',
      templateUrl: 'views/settings.html',
      targetEvent: event,
    })
    .then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  }

  var geoHandler = function(position) {
    $timeout(function() {
      loadComplete();
      $scope.userPosition = position;
      loadEvents();
    });
  };

  function addEvents(eventList) {
    angular.forEach(eventList, function(e) {
      $scope.eventQueue.enqueue(e);
    });
  };

  function loadEvents() {
    load('Loading nearby events...');
    if (bg.storage.events != null && angular.fromJson(bg.storage.events).length > 0) {
      loadComplete();
      addEvents(angular.fromJson(bg.storage.events));
      $scope.nextEvent();
      return;
    }
    _events.get({
      latitude: $scope.userPosition.coords.latitude, 
      longitude: $scope.userPosition.coords.longitude,
      range: $scope.eventRange + ($scope.unitsInKilometres? 'km' : 'mi')
    }, 
    function(rsp) {
      loadComplete();
      if (rsp.events && rsp.events.length > 0) {
        bg.storage.events = JSON.stringify(rsp.events);
        addEvents(rsp.events);
        $scope.nextEvent();
      }
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
    $scope.appName = APP_NAME;
    $scope.showTooltip = false;

    load('Fetching location...');

    navigator.geolocation.getCurrentPosition(geoHandler); //get location, pass response to handler
  };

  init();

}]);

app.controller('CardController', ['$scope', function($scope) {

  $scope.viewEvent = function() {
    chrome.tabs.create({url : $scope.event.url});
  };

  $scope.getDate = function() {
    a = new Date($scope.event.start.utc);
    return a.toLocaleString();
  };

}]);

app.controller('SettingsController', ['$scope', '$mdDialog', function($scope, $mdDialog) {

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.resolve = function(settings) {
    $mdDialog.hide(settings);
  };

}]);
