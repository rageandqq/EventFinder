var app = angular.module('EventbriteApp', []);

app.controller('MainController', ['$scope', '$timeout', function($scope, $timeout) {

  $scope.name = 'World';
  $scope.userPosition = null;

  var geoHandler = function(position) {
    $timeout(function() {
      $scope.userPosition = position;
    });
  };

  function init() {
    navigator.geolocation.getCurrentPosition(geoHandler);
  };

  init();

}]);
