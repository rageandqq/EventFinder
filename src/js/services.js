var AUTH_TOKEN = 'GKE4XT5V7P23RIPNGQPD';

app.factory('PopularEvents', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&sort_by=date&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: ''}, isArray: false } 
          });
    }
]);

app.factory('PopularEventsWithinDate', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&sort_by=date&start_date.range_start=:start&start_date.range_end=:end&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: '', start:'' , end:''}, isArray: false } 
          });
    }
]);
