var app = angular.module('GRASSPApp',['ngRoute']);

app.config(function($routeProvider,$locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'template/home.html',
        controller: 'ParkingHomeCtrl'
    })
    .when('/find-geo',{
        templateUrl: 'template/homegeo.html',
        controller: 'ParkingGeoMapCtrl'
    })
    .when('/find-locality', {
        templateUrl: 'template/homelocality.html',
        controller: 'ParkingHomeLocalityCtrl'
    })
    .when('/find-locality-parking/:locality', {
        templateUrl: 'template/showparking.html',
        controller: 'ParkingLocalityCtrl'
    })
    .when('/find-parking', {
        templateUrl: 'template/findparking.html',
        controller: 'ParkingSearchCtrl'
    })
    .when('/show-parking-All', {
        templateUrl: 'template/showparkingall.html',
        controller: 'ParkingAllMapCtrl'
    })
});





