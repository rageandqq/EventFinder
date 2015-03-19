var AUTH_TOKEN = 'GKE4XT5V7P23RIPNGQPD';

app.factory('PopularEvents', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: ''}, isArray: false } 
          });
    }
]);
