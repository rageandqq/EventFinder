//Reference to Background page, for access to storage container
bg = chrome.extension.getBackgroundPage(); //use as storage container until extension is reloaded

//Main App Controller
app.controller('MainController', ['$scope', '$timeout', '$mdDialog', '$mdToast', '$animate', 'PopularEvents', 'PopularEventsWithinDate', function($scope, $timeout,$mdDialog,  $mdToast, $animate, _events, _eventsRestricted) {

  //Dequeue event queue and set it as current event
  $scope.nextEvent = function() {
    $scope.currentEvent = $scope.eventQueue.dequeue();
  };

  //Show a toast with a message
  $scope.showToast = function(msg) {
    $mdToast.show({
      controller: ToastController,
      templateUrl: 'toast.html',
      hideDelay: 3000,
      position: 'bottom',
      locals: {
        message: msg
      }
    });
  };

  //Open the settings dialog and pass in current settings
  $scope.openSettings = function(event) {
    $mdDialog.show({
      controller: SettingsController,
      templateUrl: 'settings.html',
      targetEvent: event,
      locals: { 
        settings: {
          eventRange: $scope.eventRange,
          findEventsNextWeekend: $scope.findEventsNextWeekend,
          unitsInKilometres: $scope.unitsInKilometres
        }
      }
    })
    .then(function(settings) { //Update settings from dialog (both on $scope and background storage)
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

      if (valueChanged) { //reload if values have changed
        $scope.showToast();
        loadEvents(true);
      }
    }, function() {
      $scope.showToast('Cancelled.');
    });
  };

  //begin loading events once location has been found
  var geoHandler = function(position) { 
    $timeout(function() {
      loadComplete();
      $scope.userPosition = position;
      loadEvents();
    });
  };

  //queue a list of events
  function addEvents(eventList) {
    angular.forEach(eventList, function(e) {
      $scope.eventQueue.enqueue(e);
    });
  };

  //load events - use background storage (if any are there), unless explicity overridden
  //otherwise, load from Eventbrite API
  function loadEvents(override) {
    load('Loading nearby events...');
    $scope.eventQueue.clear();
    if (override != true && bg.storage.events != null && angular.fromJson(bg.storage.events).length > 0) {
      loadComplete();
      addEvents(angular.fromJson(bg.storage.events));
      $scope.nextEvent();
      return;
    }
    if (!$scope.findEventsNextWeekend) {
      _events.get({ //find nearby 'popular' events within range
        latitude: $scope.userPosition.coords.latitude, 
        longitude: $scope.userPosition.coords.longitude,
        range: $scope.eventRange + ($scope.unitsInKilometres? 'km' : 'mi')
      }, handleEventResponse, handleEventFailure);
    }
    else {
      var nextWeekendStart = new Date();
      var nextWeekendEnd = new Date();
      nextWeekendStart.setHours(0,0,0,0);

      var daysToAdd = 0;
      if(nextWeekendStart.getDay() != 6 && nextWeekendStart.getDay() != 0) { //if it's not saturday (6) or sunday (7) 
          nextWeekendStart = getNextDay(7-nextWeekendStart.getDay()); //add days until saturday
      }
      daysToAdd = (nextWeekendStart.getDay() == 6) ? 7 : 6; //only add 6 days if it is sunday, else 7
      nextWeekendStart.setDate(nextWeekendStart.getDate() + daysToAdd); //add 1 week, should be next saturday
      nextWeekendEnd.setDate(nextWeekendStart.getDate() + 2); //2 days after event start (very start of monday)

      _eventsRestricted.get({ //find nearby 'popular' events within range happening next weekend
        latitude: $scope.userPosition.coords.latitude, 
        longitude: $scope.userPosition.coords.longitude,
        range: $scope.eventRange + ($scope.unitsInKilometres? 'km' : 'mi'),
        start: formatUTCDateAtMidnight(nextWeekendStart),
        end: formatUTCDateAtMidnight(nextWeekendEnd)
      }, handleEventResponse, handleEventFailure);
    }
  };

  //end loading, store and queue events for vieweing
  function handleEventResponse(rsp) {
    loadComplete();
    if (rsp.events && rsp.events.length > 0) {
      bg.storage.events = JSON.stringify(rsp.events);
      addEvents(rsp.events);
      $scope.nextEvent();
    }
  };

  //end loading and display message
  function handleEventFailure(rsp) {
    loadComplete();
    $scope.showToast('Load failed, please restart.');
  };

  //end loading
  function loadComplete() {
    $scope.loadingQueue.dequeue();
  };

  //add a message to the loading queue
  function load(item) {
    $scope.loadingQueue.enqueue(item);
  };

  //Initialzie all values as required
  //Since the controller is loaded every time the popup opens, try and retrieve some values from the cached background storage.
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

    //begin fetching location
    load('Fetching location...');
    navigator.geolocation.getCurrentPosition(geoHandler); //get location, pass response to handler
  };

  //get the next day 'n' days after today
  function getNextDay(days){
    var now = new Date();    
    now.setDate(now.getDate() + (days+(7-now.getDay())) % 7);
    return now;
  };

  //format date as required by Eventbrite API
  function formatUTCDateAtMidnight(date) {
    var dateString = '';
    dateString += ('000' + date.getUTCFullYear()).slice(-4);
    dateString += '-';
    dateString += ('0' + date.getUTCMonth()).slice(-2); 
    dateString += '-';
    dateString += ('0' + date.getUTCDate()).slice(-2);
    dateString += 'T00:00:00Z';
    return dateString;
  };

  init();

}]);

//Card Controller, used to display events
app.controller('CardController', ['$scope', function($scope) {

  $scope.viewEvent = function() {
    chrome.tabs.create({url : $scope.event.url});
  };

  $scope.getDate = function() {
    a = new Date($scope.event.start.utc);
    return a.toLocaleString();
  };

}]);

//Settings Controller
//pass new values back to controller that called it
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

//Toast Controller
//Show a message with preconfigured default
function ToastController($scope, $mdToast, message) {

  $scope.message = message || 'Settings Saved!';

  $scope.closeToast = function() {
    $mdToast.hide();
  };

};
