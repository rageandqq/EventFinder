var AUTH_TOKEN = 'GKE4XT5V7P23RIPNGQPD'; //Eventbrite authorization key

//Get list of 'popular' events near a location, within a range.
//Sort by date
app.factory('PopularEvents', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&sort_by=date&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: ''}, isArray: false } 
          });
    }
]);

//Get list of 'popular' events near a location, within a distance range and a date range.
//Also sorts by date.
app.factory('PopularEventsWithinDate', ['$resource', 
    function($resource) {
      return $resource('https://www.eventbriteapi.com/v3/events/search?location.latitude=:latitude&location.longitude=:longitude&location.within=:range&popular=true&sort_by=date&start_date.range_start=:start&start_date.range_end=:end&token=' + AUTH_TOKEN, {}, {
          query: { method: 'GET', params: {latitude:'', longitude:'', range: '', start:'' , end:''}, isArray: false } 
          });
    }
]);
