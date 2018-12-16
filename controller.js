var app = angular.module('GRASSPApp');

/* geo location
var myApp = angular.module('myApp', ['geolocation']);
myApp.controller('mainCtrl',[' $scope','$geolocation',function ($scope, $geolocation) {
    $scope.coords = $geolocation.getLocation()
        .then(function (data) {
            return { lat: data.coords.latitude, 
                     long: data.coords.longitude };
        });
}]);
/* ends here */

/* This controller is for the parking module home page*/
app.controller('ParkingHomeCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.findGeo = function () {
        $location.path('/find-geo');
    }
    $scope.findLocality = function () {
        $location.path('/find-locality');
    }
    $scope.searchingParking = function () {
        $location.path('/find-parking');
    }

}]);
/* this controller is for finding geolocation and displaying parking places accordingly */
app.controller('ParkingGeoMapCtrl', ['$scope', '$location', 'displayGeoParking', 'displayParking', function ($scope, $location, displayGeoParking, displayParking) {
    navigator.geolocation.getCurrentPosition(function (pos) {
        // store the coordinates returned from geolocation function in an array named destination
        var destination = [];
        destination.push(pos.coords.longitude, pos.coords.latitude);

        /* Include code for map */
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3ViYWNoYWtvbXZ1eCIsImEiOiJjanA1dWdmdmYxM3hvM3ZwOGl5YmhlcjF1In0.tH29ScahPnZ4UvgBMMUBOA';
        var map = new mapboxgl.Map({
            container: 'geo-map', // container id
            style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
            center: destination, // [lng, lat] of current position in array
            zoom: 13 // starting zoom
        });
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());
        // create user position marker
        var elUser = document.createElement('div');
        elUser.id = 'user-marker';
        var popup = new mapboxgl.Popup({ offset: 20 }).setHTML('<h4 style="color:blue">' + "You are here" + '</h4>');
        // create the user position marker
        new mapboxgl.Marker(elUser)
            .setLngLat(destination) // sets longitude and latitude for a marker
            .setPopup(popup) // sets a popup on this marker
            .addTo(map); // add to map variable defined earlier

        // call service to get data for particular latitude , longitude, distance in metres 
        displayGeoParking.getGeoParkingData(destination)
            .then(function (output) {
                var parkNearData = output.data.records;

                parkNearData.forEach(function (item) {
                    // create car location marker
                    var elCar = document.createElement('div');
                    elCar.id = 'marker';
                    // create the popup for marker
                    var popupCar = new mapboxgl.Popup({ offset: 20 }).setHTML('<h4 style="color:blue">' + item.fields.plats + '</h4><h6>' + "Avgift : " + item.fields.taxa + 'kr/tim</h6><h6>' + "Tid : " + item.fields.tid + '</h6><p>' + "Kl. " + item.fields.avgift + '</p>');
                    // store latitude and longitude of each parking place in array plats
                    var plats = [];
                    plats.push(item.geometry.coordinates[0], item.geometry.coordinates[1]);

                    // create the user position marker
                    new mapboxgl.Marker(elCar)
                        .setLngLat(plats) // sets longitude and latitude for a parking marker
                        .setPopup(popupCar) // sets a popup on this marker
                        .addTo(map); // add to map variable defined earlier
                })
            })

        // call service to get all records
        var distance = [];
        var nearParkingArray = [];
        displayParking.getParkingData()
            .then(function (output) {
                var result = output.data.records;

                result.forEach(function (item) {
                    /* the following code calculates distance of each parking spot from user's current location */
                    if ((pos.coords.latitude == item.geometry.coordinates[1]) && (pos.coords.longitude == item.geometry.coordinates[0])) {
                        distance.push(0);
                        nearParkingArray.push(
                            {
                                name: item.fields.plats,
                                avgift: item.fields.taxa,
                                tid: item.fields.tid,
                                klock: item.fields.avgift,
                                lon: item.geometry.coordinates[0],
                                lat: item.geometry.coordinates[1],
                                dis: 0
                            }
                        );
                    }
                    else {
                        var radlat1 = Math.PI * (item.geometry.coordinates[1]) / 180;
                        var radlat2 = Math.PI * (pos.coords.latitude) / 180;
                        if (pos.coords.longitude > item.geometry.coordinates[0]) {
                            var theta = pos.coords.longitude - item.geometry.coordinates[0];
                        }
                        else {
                            var theta = item.geometry.coordinates[0] - pos.coords.longitude;
                        }

                        var radtheta = Math.PI * theta / 180;
                        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                        if (dist > 1) {
                            dist = 1;
                        }
                        dist = Math.acos(dist);
                        dist = dist * 180 / Math.PI;
                        dist = dist * 60 * 1.1515;
                        dist = dist * 1.609344 /* unit is kilometres*/
                        distance.push(dist);
                        /* store corresponding values of each parking spot with distance in nearParkingArray */
                        nearParkingArray.push(
                            {
                                name: item.fields.plats,
                                avgift: item.fields.taxa,
                                tid: item.fields.tid,
                                klock: item.fields.avgift,
                                lon: item.geometry.coordinates[0],
                                lat: item.geometry.coordinates[1],
                                dis: dist
                            }
                        );
                    }
                })
                /* Sort the array in ascending order so only nearest parking lots are displayed */
                nearParkingArray.sort(function (a, b) { return a.dis - b.dis });
                /* Now nearParkingArray contains the ascending list of nearest parking places */
                $scope.displayDistance = nearParkingArray;
                /* following code displays the nearest parking spots */

                /* display only the 3 nearest parking places */
                for (var i = 0; i < 4; i++) {
                    // create car location marker
                    var elCar = document.createElement('div');
                    elCar.id = 'marker';
                    /* create the popup for marker*/
                    var popupCar = new mapboxgl.Popup({ offset: 20 }).setHTML('<h4 style="color:blue">' + nearParkingArray[i].name + '</h4><h6>' + "Avgift : " + nearParkingArray[i].avgift + ' kr/tim' + '</h6><h6>' + "Tid : " + nearParkingArray[i].tid + '</h6><h6>' + "Kl. " + nearParkingArray[i].klock + '</h6><p>' + "Dis. " + (nearParkingArray[i].dis).toFixed(2) + " km" + '</p>');
                    /* store latitude and longitude of each parking place in array plats*/
                    var plats = [nearParkingArray[i].lon, nearParkingArray[i].lat];
                    /* create the user position marker */
                    new mapboxgl.Marker(elCar)
                        .setLngLat(plats) // sets longitude and latitude for a parking marker
                        .setPopup(popupCar) // sets a popup on this marker
                        .addTo(map); // add to map variable defined earlier   
                }
            });
    })
    $scope.returnSearchOption = function () {
        $location.path('/');
    }
}]);
app.controller('ParkingHomeLocalityCtrl', ['$scope', '$location', 'displayLocality', function ($scope, $location, displayLocality) {
    displayLocality.getLocalityData()
        .then(function (output) {
            $scope.displayLocality = output.data.facet_groups[0].facets;
        });
    $scope.findlocalityparking = function (parkingPlace) {
        $location.path('/find-locality-parking/' + parkingPlace);
    }


}]);
app.controller('ParkingSearchCtrl', ['$scope', '$location', 'displayParking', function ($scope, $location, displayParking) {
    displayParking.getParkingData()
        .then(function (output) {
            $scope.displayData = output.data.records;

        });
    $scope.showParkingMap = function () {
        $location.path('/show-parking-All');
    }
}]);
app.controller('ParkingLocalityCtrl', ['$scope', '$location', '$routeParams', 'displayLocalityParking', function ($scope, $location, $routeParams, displayLocalityParking) {
    var userLocality = $routeParams.locality;
    /* replace all whitespace characters, i.e. blank spaces between words by '+'. So it can be used in url */
    var newLocality = userLocality.replace(/\s/g, "+");
    /* call service to get data*/
    displayLocalityParking.getLocalityParkingData(newLocality)
        .then(function (output) {
            $scope.displayData = output.data.records;
            // store values of latitude and longitude in session storage, to send to onlyparking.html
            var destinationArray = [];
            var count = (output.data.records).length;
            /* for each record of parking spot */
            for (var i = 0; i < count; i++) {
                /* the name ,latitude and longitude and other details of each parking spot is pushed in array */
                destinationArray.push(
                    {
                        name: output.data.records[i].fields.plats,
                        avgift: output.data.records[i].fields.taxa,
                        tid: output.data.records[i].fields.tid,
                        klock: output.data.records[i].fields.avgift,
                        lon: output.data.records[i].geometry.coordinates[0],
                        lat: output.data.records[i].geometry.coordinates[1]
                    }
                );
            }
            /* store name of parking spot in a variable and convert it into uppercase letters*/
            var lowerCaseParkingSpot = output.data.records[0].fields.plats;
            $scope.upperCaseParkingSpot = lowerCaseParkingSpot.toUpperCase();

            /* Include code for map */
            mapboxgl.accessToken = 'pk.eyJ1Ijoic3ViYWNoYWtvbXZ1eCIsImEiOiJjanA1dWdmdmYxM3hvM3ZwOGl5YmhlcjF1In0.tH29ScahPnZ4UvgBMMUBOA';
            var map = new mapboxgl.Map({
                container: 'parking-map', // container id
                style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
                center: destinationArray[0], // [lng, lat] of 1st parking lot in array
                zoom: 15 // starting zoom
            });

            // Add zoom and rotation controls to the map.
            map.addControl(new mapboxgl.NavigationControl());
            /* create marker from records for each parking spot*/
            destinationArray.forEach(function (item) {
                /* plats array stores longitude and latitude of each parking spot */
                var plats = [item.lon, item.lat];
                // create DOM element for the marker
                var el = document.createElement('div');
                el.id = 'marker';
                // create the popup
                var popup = new mapboxgl.Popup({ offset: 20 }).setHTML('<h4 style="color:blue">' + item.name + '</h4><h6>' + "Avgift : " + item.avgift + 'kr/tim</h6><h6>' + "Tid : " + item.tid + '</h6><p>' + "Kl. " + item.klock + '</p>');

                // create the marker
                new mapboxgl.Marker(el)
                    .setLngLat(plats) // sets longitude and latitude for a marker
                    .setPopup(popup) // sets a popup on this marker
                    .addTo(map); // add to map variable defined earlier
            })
            /* code for map ends*/
        });
    $scope.showParkingMap = function () {
        $location.path('/show-parking-All');
    }
    $scope.displayParkingLot = function () {
        $location.path('/show-parking');
    }
    $scope.returnLocalityList = function () {
        $location.path('/find-locality');
    }
}]);

app.controller('ParkingAllMapCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.showParkingList = function () {
        $location.path('/find-parking');
    }
}]);