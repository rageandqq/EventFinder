bg = chrome.extension.getBackgroundPage(); //use as storage container until extension is reloaded

app.controller('MainController', ['$scope', '$timeout', '$mdDialog', '$mdToast', '$animate', 'PopularEvents', function($scope, $timeout,$mdDialog,  $mdToast, $animate, _events) {

  $scope.nextEvent = function() {
    $scope.currentEvent = $scope.eventQueue.dequeue();
  };

  $scope.showToast = function(msg) {
    $mdToast.show({
      controller: ToastController,
      templateUrl: 'views/toast.html',
      hideDelay: 3000,
      position: 'bottom',
      locals: {
        message: msg
      }
    });
  };

  $scope.openSettings = function(event) {
    $mdDialog.show({
      controller: SettingsController,
      templateUrl: 'views/settings.html',
      targetEvent: event,
      locals: { 
        settings: {
          eventRange: $scope.eventRange,
          findEventsNextWeekend: $scope.findEventsNextWeekend,
          unitsInKilometres: $scope.unitsInKilometres
        }
      }
    })
    .then(function(settings) {
      if (bg.storage == null) {
        bg.storage = {};
      }
      var valueChanged = 
            (settings.eventRange != $scope.eventRange
          || settings.findEventsNextWeekend != $scope.findEventsNextWeekend
          || settings.unitsInKilometres != $scope.unitsInKilometres);

      bg.storage.eventRange = $scope.eventRange = settings.eventRange;
      bg.storage.findEventsNextWeekend = $scope.findEventsNextWeekend = settings.findEventsNextWeekend;
      bg.storage.unitsInKilometres = $scope.unitsInKilometres = settings.unitsInKilometres;

      if (valueChanged) {
        loadEvents(true);
        $scope.showToast();
      }
    }, function() {
      $scope.showToast('Cancelled.');
    });
  };

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

  function loadEvents(override) {
    load('Loading nearby events...');
    if (override != true && bg.storage.events != null && angular.fromJson(bg.storage.events).length > 0) {
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
    $scope.eventRange = bg.storage.eventRange || 20;
    $scope.unitsInKilometres = bg.storage.unitsInKilomteres || true;
    $scope.currentEvent = null;
    $scope.eventQueue = new Queue();
    $scope.loadingQueue = new Queue();
    $scope.appName = APP_NAME;
    $scope.showTooltip = false;
    $scope.findEventsNextWeekend = bg.storage.findEventsNextWeekend || false;

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

function SettingsController ($scope, $mdDialog, settings) {

  $scope.settings = settings;

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.resolve = function() {
    $mdDialog.hide({
      eventRange: $scope.settings.eventRange,
      findEventsNextWeekend: $scope.settings.findEventsNextWeekend,
      unitsInKilometres: $scope.settings.unitsInKilometres 
    });
  };

  $scope.getUnits = function() {
    return $scope.settings.unitsInKilometres?'kilometres':'miles';
  };

};

function ToastController($scope, $mdToast, message) {

  $scope.message = message || 'Settings Saved!';

  $scope.closeToast = function() {
    $mdToast.hide();
  };

};
