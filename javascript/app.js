/// <reference path="../typings/index.d.ts" />

var app = angular.module('yelpVis', ['ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('red')
            .accentPalette('grey');
    });

// The main controller for the application.
app.controller('MainController', function($scope) {

    });
