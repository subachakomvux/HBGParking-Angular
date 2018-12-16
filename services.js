var app = angular.module('GRASSPApp');

app.factory('displayParking', ['$http', function ($http) {
    var newData = {
        getParkingData: function () {
            var url = 'https://helsingborg.opendatasoft.com/api/records/1.0/search/?dataset=parkering_new&rows=100&facet=plats&facet=status&exclude.status=BORTPLOCKAD&exclude.status=AVST%C3%84NGD';
            return $http.get(url)
                .then(function (data) {
                    return (data);
                })
        }
    };
    return newData;
}]);

app.factory('displayLocality', ['$http', function ($http) {
    var newLocalityData = {
        getLocalityData: function () {
            var url = 'https://helsingborg.opendatasoft.com/api/records/1.0/search/?dataset=parkering_new&rows=20&facet=plats&facet=status&exclude.status=AVST%C3%84NGD&exclude.status=BORTPLOCKAD';
            return $http.get(url)
                .then(function (data) {
                    return (data);
                })
        }
    };
    return newLocalityData;
}]);
app.factory('displayLocalityParking', ['$http', function ($http) {
    var newParkingData = {
        getLocalityParkingData: function (userLocality) {
            var url = 'https://helsingborg.opendatasoft.com/api/records/1.0/search/?dataset=parkering_new&rows=20&facet=plats&facet=status&refine.plats=' + userLocality + '&exclude.status=AVST%C3%84NGD&exclude.status=BORTPLOCKAD';
            return $http.get(url)
                .then(function (data) {
                    return (data);
                })
        }
    };
    return newParkingData;
}]);
app.factory('displayGeoParking', ['$http', function ($http) {
    var geoParkingData = {
        getGeoParkingData: function (position) {
            var url = 'https://helsingborg.opendatasoft.com/api/records/1.0/search/?dataset=parkering_new&rows=20&geofilter.distance=' + position[0] + '%2C' + position[1] + '%2C1500';
            return $http.get(url)
                .then(function (data) {
                    return (data);
                })
        }
    };
    return geoParkingData;
}]);