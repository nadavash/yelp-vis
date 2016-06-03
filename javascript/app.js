/// <reference path="../typings/index.d.ts" />
'use strict';

var app = angular.module('yelpVis', ['ngMaterial', 'uiGmapgoogle-maps'])
    .config(function($mdThemingProvider,
                     $mdIconProvider,
                     uiGmapGoogleMapApiProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('red')
            .accentPalette('blue');

        $mdIconProvider.fontSet('md', 'material-icons');

        uiGmapGoogleMapApiProvider.configure({
            libraries: 'geometry,visualization'
        });
    });

// The main controller for the application.
app.controller('MainController', function($scope,
                                          $window,
                                          $http,
                                          $mdDialog,
                                          uiGmapIsReady) {
    // Share google maps api for directives in this controller.
    $scope.uiGmapIsReady = uiGmapIsReady;
    $scope.map = {
        center: { latitude: 36.1699, longitude: -115.1398 },
        zoom: 12,
        control: {},
        options: {
            streetViewControl: false,
            zoomControl: false
        }
    };

    // Tutorial
    $scope.tutorialActive = false;

    // Map visualization controls
    $scope.days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday'
    ];
    $scope.selectedDay = null;// 6;
    $scope.hours = d3.range(24);
    $scope.selectedHour = null;// 11;
    $scope.checkinData = null;

    $scope.selectionBounds = null;

    // Private variables
    var checkinData = null;

    d3.json('/data/checkins.json', function(err, data) {
        if (err) {
            throw err;
        }

        checkinData = data;
    });

    // Watch for change in date to change the data we expose to the map
    // visualization directive.
    $scope.$watchGroup(['selectedDay', 'selectedHour'],
        function() {
            if ($scope.selectedDay === null || $scope.selectedHour === null) {
                return;
            }

            var locations = [];
            var sizes = checkinData[$scope.selectedHour + '-' + $scope.selectedDay]
                .filter(function(val, i) {
                    if (val > 0) {
                        locations.push(checkinData.businesses[i]);
                        return true;
                    } else {
                        return false;
                    }
                });
            sizes = sizes.map(function(value, index) {
                return {
                    size: value,
                    business_id: locations[index].business_id
                };
            });

            $scope.checkinData = {
                locations: locations,
                sizes: sizes
            };
        });

    $scope.showAdvanced = function(ev) {
        $mdDialog.show({
            controller: 'BusinessDialogController',
            templateUrl: '/html/business-dialog.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: true
        });
    };
});
