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
    $scope.tutorialActive = true;

    // Map visualization controls
    $scope.days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday'
    ];
    $scope.selectedDay = null;// 6;
    $scope.hours = d3.range(24);
    $scope.selectedHour = null;// 11;
    $scope.checkinData = null;

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
});

app.directive('yelpVisOverlay', function() {
    return {
        scope: false,
        link: function(scope, elem) {
            var map = null;
            var originalBounds = null;
            var originalZoom = null;
            var overlay = null;

            var checkinsMap = new bubbleMap()
                .minBubbleRadius(1.5)
                .maxBubbleRadius(25)
                .transitionDuration(500);

            // Initialized overlay when the API is finished loading.
            scope.uiGmapIsReady.promise(1).then(function(instances) {
                // Set the map reference for this directive.

                // Create the map overlay for layering custom SVG elements on top of the
                // map.
                map = instances[0].map;

                overlay = new google.maps.OverlayView();
                overlay.onAdd = function() {
                    originalBounds = map.getBounds();
                    originalZoom = map.getZoom();
                }

                overlay.draw = function() {
                    var projection = overlay.getProjection();

                    if (projection === undefined) {
                        return;
                    }

                    var sw = projection.fromLatLngToDivPixel(
                        map.getBounds().getSouthWest());
                    var ne = projection.fromLatLngToDivPixel(
                        map.getBounds().getNorthEast());

                    var origSw = projection.fromLatLngToDivPixel(
                        originalBounds.getSouthWest());
                    var origNe = projection.fromLatLngToDivPixel(
                        originalBounds.getNorthEast());

                    checkinsMap.width(ne.x - sw.x)
                        .height(sw.y - ne.y);

                    var svgLayer = d3.select(overlay.getPanes().overlayLayer)
                        .select('svg');

                    var currZoom = originalZoom - map.getZoom();
                    var zoomFactor = Math.pow(2, currZoom);
                    var viewBox = {
                        x: (sw.x - origSw.x) * zoomFactor,
                        y: (ne.y - origNe.y) * zoomFactor,
                        width: (ne.x - sw.x) * zoomFactor,
                        height: (sw.y - ne.y) * zoomFactor
                    };

                    svgLayer.style('left', sw.x + 'px')
                        .style('top', ne.y + 'px')
                        .style('width', (ne.x - sw.x) + 'px')
                        .style('height', (sw.y - ne.y) + 'px')
                        .attr('viewBox', viewBox.x + ' ' + viewBox.y + ' '
                            + viewBox.width + ' ' + viewBox.height);
                };

                overlay.setMap(scope.map.control.getGMap());

                map.addListener('bounds_changed', overlay.draw);
            });

            scope.$watch('checkinData', function(checkinData) {
                if (checkinData === null) {
                    return;
                }

                overlay.draw();

                var datum = {
                    projection: overlay.getProjection(),
                    locations: checkinData.locations,
                    sizes: checkinData.sizes,
                    maps: google.maps
                };

                d3.select(overlay.getPanes().overlayLayer)
                    .datum(datum)
                    .call(checkinsMap);

                overlay.draw();
            }, true);
        }
    };
});
