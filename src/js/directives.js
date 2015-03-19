app.directive('eventCard', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/card.html',
    controller: 'CardController',
    scope : {
      'event' : '=event'
    }
  }
});
