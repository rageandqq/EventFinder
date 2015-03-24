//Card directive
//Displays event. Bind the 'event' from Main controller to be accessed within the card.
app.directive('eventCard', function() {
  return {
    restrict: 'E',
    templateUrl: 'card.html',
    controller: 'CardController',
    scope : {
      'event' : '=event'
    }
  }
});
