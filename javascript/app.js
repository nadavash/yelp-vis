/// <reference path="../typings/index.d.ts" />

var app = angular.module('yelpVis', ['ngMaterial', 'uiGmapgoogle-maps'])
    .config(function($mdThemingProvider, uiGmapGoogleMapApiProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('red')
            .accentPalette('grey');

        uiGmapGoogleMapApiProvider.configure({
            //    key: 'your api key',
            v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'geometry,visualization'
        });
    });

// The main controller for the application.
app.controller('MainController', function($scope, uiGmapGoogleMapApi) {
    $scope.map = { center: { latitude: 36.1699, longitude: -115.1398 }, zoom: 12 };
    uiGmapGoogleMapApi.then(function(maps) {

    });


});
